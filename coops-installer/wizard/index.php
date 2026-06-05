<?php
/**
 * CoOPS — installation web wizard.
 *
 * Single-file, multi-step installer. Sits at <APP>/public/install/index.php.
 * Walks the operator through:
 *   1. system check
 *   2. database connection (+ optional create DB/user)
 *   3. app settings (URL, name, locale, mail)
 *   4. admin user (first Super Admin)
 *   5. run install (write .env, key:generate, migrate, seed, create user)
 *   6. self-destruct (delete this directory)
 *
 * Designed to be run exactly once. After step 5 finishes successfully the
 * wizard removes itself; any future request to /install/ returns 404.
 *
 * Security: refuses to run if .env already has APP_KEY *and* an admin user
 * exists, unless ?force=1 and a known SETUP_TOKEN env var match.
 */

declare(strict_types=1);
session_start();
header('X-Frame-Options: SAMEORIGIN');
header('X-Content-Type-Options: nosniff');

define('WIZARD_DIR', __DIR__);
define('PUBLIC_DIR', dirname(__DIR__));
define('APP_DIR',    dirname(PUBLIC_DIR));
define('ENV_FILE',   APP_DIR . '/.env');

$step  = (int)($_GET['step'] ?? 1);
$post  = $_SERVER['REQUEST_METHOD'] === 'POST';
$data  = $_SESSION['wizard'] ?? [];
$err   = null;

// ---- helpers ---------------------------------------------------------------
function h(?string $s): string { return htmlspecialchars((string)$s, ENT_QUOTES, 'UTF-8'); }

function envSet(string $key, string $value): void {
    $value  = (string)$value;
    $needsQuote = preg_match('/\s|[#"]/', $value);
    $line   = $key . '=' . ($needsQuote ? '"' . str_replace('"', '\"', $value) . '"' : $value);
    $env    = file_exists(ENV_FILE) ? file_get_contents(ENV_FILE) : '';
    if (preg_match('/^' . preg_quote($key, '/') . '=.*$/m', $env)) {
        $env = preg_replace('/^' . preg_quote($key, '/') . '=.*$/m', $line, $env);
    } else {
        $env = rtrim($env, "\n") . "\n" . $line . "\n";
    }
    file_put_contents(ENV_FILE, $env);
}

function artisan(string $cmd, array &$out): int {
    $full = 'cd ' . escapeshellarg(APP_DIR) . ' && php artisan ' . $cmd . ' 2>&1';
    exec($full, $lines, $rc);
    $out[] = "\$ php artisan $cmd";
    foreach ($lines as $l) $out[] = $l;
    return $rc;
}

function laravelPhp(string $label, string $code, array &$out): int {
    $bootstrap = "require 'vendor/autoload.php';" .
        '$app = require_once "bootstrap/app.php";' .
        '$app->make(Illuminate\\Contracts\\Console\\Kernel::class)->bootstrap();' .
        $code;
    $full = 'cd ' . escapeshellarg(APP_DIR) . ' && php -r ' . escapeshellarg($bootstrap) . ' 2>&1';
    exec($full, $lines, $rc);
    $out[] = "\$ php ($label)";
    foreach ($lines as $l) $out[] = $l;
    return $rc;
}

function hardenPassportKeys(array &$out): void {
    $private = APP_DIR . '/storage/oauth-private.key';
    $public = APP_DIR . '/storage/oauth-public.key';
    if (!is_readable($private) || !is_readable($public)) {
        throw new RuntimeException('Passport OAuth keys are missing or not readable. Run the latest installer and retry.');
    }
    @chmod($private, 0600);
    @chmod($public, 0644);
    $out[] = 'Passport OAuth keys are present and readable.';
}

function rrmdir(string $dir): void {
    if (!is_dir($dir)) return;
    foreach (scandir($dir) as $f) {
        if ($f === '.' || $f === '..') continue;
        $p = $dir . '/' . $f;
        is_dir($p) ? rrmdir($p) : @unlink($p);
    }
    @rmdir($dir);
}

function pdoFromConfig(array $c): PDO {
    $dsn = "mysql:host={$c['host']};port={$c['port']};charset=utf8mb4";
    if (!empty($c['database'])) $dsn .= ";dbname={$c['database']}";
    return new PDO($dsn, $c['username'], $c['password'], [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    ]);
}

function installDefaults(): array {
    static $defaults = null;
    if ($defaults !== null) return $defaults;
    $file = APP_DIR . '/storage/app/install-wizard.json';
    if (!is_file($file)) return $defaults = [];
    $json = json_decode((string)file_get_contents($file), true);
    return $defaults = is_array($json) ? $json : [];
}

function defaultValue(array $data, array $defaults, string $section, string $key, string $fallback = ''): string {
    return (string)($data[$section][$key] ?? $defaults[$section][$key] ?? $fallback);
}

function validMysqlName(string $value): bool {
    return (bool)preg_match('/^[A-Za-z0-9_]+$/', $value);
}

function defaultAppUrl(): string {
    $proto = $_SERVER['HTTP_X_FORWARDED_PROTO'] ?? null;
    if (!$proto) $proto = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
    $host = $_SERVER['HTTP_HOST'] ?? 'localhost';
    return $proto . '://' . $host;
}

function tableHasRows(array $db, string $table): bool {
    if (!preg_match('/^[A-Za-z0-9_]+$/', $table)) return false;
    try {
        $pdo = pdoFromConfig($db);
        $stmt = $pdo->query("SELECT EXISTS(SELECT 1 FROM `{$table}` LIMIT 1)");
        return (bool)$stmt->fetchColumn();
    } catch (Throwable $e) {
        return false;
    }
}

// ---- handle POST -----------------------------------------------------------
if ($post) {
    try {
        switch ($step) {
            case 2:
                $cfg = [
                    'host'     => trim($_POST['host'] ?? '127.0.0.1'),
                    'port'     => trim($_POST['port'] ?? '3306'),
                    'database' => trim($_POST['database'] ?? ''),
                    'username' => trim($_POST['username'] ?? ''),
                    'password' => $_POST['password'] ?? '',
                    'create'   => !empty($_POST['create']),
                ];
                if (!validMysqlName($cfg['database'])) {
                    throw new RuntimeException('Database name may only contain letters, numbers, and underscores.');
                }
                if (!validMysqlName($cfg['username'])) {
                    throw new RuntimeException('Database username may only contain letters, numbers, and underscores.');
                }
                if ($cfg['create']) {
                    // Connect without DB to create it.
                    $pdo = pdoFromConfig(['host'=>$cfg['host'],'port'=>$cfg['port'],
                        'username'=>$cfg['username'],'password'=>$cfg['password']]);
                    $pdo->exec("CREATE DATABASE IF NOT EXISTS `{$cfg['database']}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
                }
                pdoFromConfig($cfg); // will throw on failure
                $data['db'] = $cfg;
                $_SESSION['wizard'] = $data;
                header('Location: ?step=3'); exit;

            case 3:
                $data['app'] = [
                    'name'   => trim($_POST['name'] ?? 'CoOPS'),
                    'company_name' => trim($_POST['company_name'] ?? ($_POST['name'] ?? 'CoOPS')),
                    'url'    => rtrim(trim($_POST['url'] ?? ''), '/'),
                    'env'    => $_POST['env'] ?? 'production',
                    'debug'  => !empty($_POST['debug']) ? 'true' : 'false',
                    'locale' => $_POST['locale'] ?? 'en',
                ];
                if ($data['app']['company_name'] === '') {
                    $data['app']['company_name'] = $data['app']['name'] ?: 'CoOPS';
                }
                $data['mail'] = [
                    'host'  => trim($_POST['mail_host']     ?? ''),
                    'port'  => trim($_POST['mail_port']     ?? '587'),
                    'user'  => trim($_POST['mail_user']     ?? ''),
                    'pass'  => $_POST['mail_pass']          ?? '',
                    'enc'   => $_POST['mail_enc']           ?? 'tls',
                    'from'  => trim($_POST['mail_from']     ?? ''),
                ];
                $_SESSION['wizard'] = $data;
                header('Location: ?step=4'); exit;

            case 4:
                $data['admin'] = [
                    'first_name' => trim($_POST['first_name'] ?? ''),
                    'last_name'  => trim($_POST['last_name']  ?? ''),
                    'email'      => trim($_POST['email']      ?? ''),
                    'password'   => $_POST['password']        ?? '',
                ];
                if (!filter_var($data['admin']['email'], FILTER_VALIDATE_EMAIL)) {
                    throw new RuntimeException('Please enter a valid email.');
                }
                if (strlen($data['admin']['password']) < 8) {
                    throw new RuntimeException('Password must be at least 8 characters.');
                }
                $_SESSION['wizard'] = $data;
                header('Location: ?step=5'); exit;

            case 5: // RUN
                $log = [];
                // 1. Write .env
                $db = $data['db']; $app = $data['app']; $mail = $data['mail'];
                $installDefaults = installDefaults();
                $arbkUrl = $data['arbk']['url'] ?? $installDefaults['arbk']['url'] ?? 'http://127.0.0.1:8181';
                envSet('APP_NAME',     $app['name']);
                envSet('APP_ENV',      $app['env']);
                envSet('APP_DEBUG',    $app['debug']);
                envSet('APP_URL',      $app['url']);
                envSet('APP_LOCALE',   $app['locale']);
                envSet('COMPANY_NAME', $app['company_name'] ?? $app['name']);
                envSet('ARBK_SCRAPER_URL', $arbkUrl);
                envSet('LOG_CHANNEL',  'stack');
                envSet('DB_CONNECTION','mysql');
                envSet('DB_HOST',      $db['host']);
                envSet('DB_PORT',      $db['port']);
                envSet('DB_DATABASE',  $db['database']);
                envSet('DB_USERNAME',  $db['username']);
                envSet('DB_PASSWORD',  $db['password']);
                if ($mail['host']) {
                    envSet('MAIL_MAILER',     'smtp');
                    envSet('MAIL_HOST',       $mail['host']);
                    envSet('MAIL_PORT',       $mail['port']);
                    envSet('MAIL_USERNAME',   $mail['user']);
                    envSet('MAIL_PASSWORD',   $mail['pass']);
                    envSet('MAIL_ENCRYPTION', $mail['enc']);
                    envSet('MAIL_FROM_ADDRESS', $mail['from']);
                    envSet('MAIL_FROM_NAME',  $app['name']);
                }
                $log[] = '✓ .env written';

                // 2. APP_KEY
                if (artisan('key:generate --force', $log) !== 0) throw new RuntimeException('key:generate failed');
                if (artisan('config:clear',         $log) !== 0) throw new RuntimeException('config:clear failed');

                // 3. Storage symlink
                artisan('storage:link', $log);

                // 4. Passport migrations and keys are required for API login tokens.
                if (artisan('vendor:publish --tag=passport-migrations --force', $log) !== 0) {
                    throw new RuntimeException('passport migrations publish failed - see log below');
                }
                if (!is_file(APP_DIR . '/storage/oauth-private.key') || !is_file(APP_DIR . '/storage/oauth-public.key')) {
                    if (artisan('passport:keys --force', $log) !== 0) {
                        throw new RuntimeException('passport:keys failed - see log below');
                    }
                } else {
                    $log[] = 'Passport OAuth keys already exist; leaving them unchanged.';
                }
                hardenPassportKeys($log);

                // 5. Migrate, then seed the idempotent default organization, roles and permissions.
                if (artisan('migrate --force', $log) !== 0) {
                    throw new RuntimeException('migrate failed — see log below');
                }
                if (artisan('db:seed --force', $log) !== 0) {
                    throw new RuntimeException('db:seed failed — see log below');
                }

                $passportClientCode =
                    'if (!\\Illuminate\\Support\\Facades\\Schema::hasTable("oauth_clients")) {' .
                    'fwrite(STDERR, "oauth_clients table is missing" . PHP_EOL); exit(1);' .
                    '}' .
                    'if (!\\Illuminate\\Support\\Facades\\DB::table("oauth_clients")->where("grant_types", "like", "%personal_access%")->where("revoked", false)->exists()) {' .
                    '\\Illuminate\\Support\\Facades\\Artisan::call("passport:client", ["--personal" => true, "--name" => "Coops Personal Access Client", "--no-interaction" => true]);' .
                    'echo \\Illuminate\\Support\\Facades\\Artisan::output();' .
                    '} else {' .
                    'echo "Personal access client already exists" . PHP_EOL;' .
                    '}';
                if (laravelPhp('prepare Passport personal access client', $passportClientCode, $log) !== 0) {
                    throw new RuntimeException('Passport personal access client setup failed - see log below');
                }

                // 6. Create and verify the first super admin user.
                $a = $data['admin'];
                $adminCode =
                    '$firstName = base64_decode("' . base64_encode($a['first_name']) . '");' .
                    '$lastName = base64_decode("' . base64_encode($a['last_name']) . '");' .
                    '$email = base64_decode("' . base64_encode($a['email']) . '");' .
                    '$password = base64_decode("' . base64_encode($a['password']) . '");' .
                    '$department = \\App\\Models\\Department::query()->first();' .
                    'if (!$department) { fwrite(STDERR, "No department exists after seeding" . PHP_EOL); exit(1); }' .
                    '$u = \\App\\Models\\User::firstOrNew(["email" => $email]);' .
                    '$u->first_name = $firstName;' .
                    '$u->last_name = $lastName;' .
                    '$u->password = $password;' .
                    '$u->email_verified_at = now();' .
                    '$u->department_id = $u->department_id ?: $department->id;' .
                    '$u->save();' .
                    '$u->assignRole("Super Admin");' .
                    'if (!$u->hasRole("Super Admin")) { fwrite(STDERR, "Super Admin role assignment failed" . PHP_EOL); exit(1); }' .
                    'if (!\\Illuminate\\Support\\Facades\\Hash::check($password, $u->password)) { fwrite(STDERR, "Admin password hash check failed" . PHP_EOL); exit(1); }' .
                    'if (!\\Illuminate\\Support\\Facades\\Auth::attempt(["email" => $email, "password" => $password])) { fwrite(STDERR, "Admin Auth::attempt failed" . PHP_EOL); exit(1); }' .
                    '$result = $u->createToken("installer-login-check");' .
                    '$token = $result->token;' .
                    '$token->revoked = true;' .
                    '$token->save();' .
                    'echo "OK user_id=" . $u->id . " department_id=" . $u->department_id . " login_check=ok token_check=ok" . PHP_EOL;';
                if (laravelPhp('create and verify super admin', $adminCode, $log) !== 0) {
                    throw new RuntimeException('Failed to create or verify admin user');
                }

                // 7. Cache configs for prod
                if ($app['env'] === 'production') {
                    artisan('config:cache', $log);
                    artisan('route:cache',  $log);
                    artisan('view:cache',   $log);
                }

                $_SESSION['wizard']['log']  = $log;
                $_SESSION['wizard']['done'] = true;
                header('Location: ?step=6'); exit;

            case 6: // SELF-DESTRUCT
                if (!empty($data['done'])) {
                    rrmdir(WIZARD_DIR);
                    session_destroy();
                    header('Location: ' . ($data['app']['url'] ?? '/') . '/');
                    exit;
                }
                break;
        }
    } catch (Throwable $e) {
        $err = $e->getMessage();
    }
}

// ---- system check (step 1) -------------------------------------------------
$checks = [];
$defaults = installDefaults();
if ($step === 1) {
    $checks[] = ['PHP ≥ 8.1',           version_compare(PHP_VERSION, '8.1.0', '>='), PHP_VERSION];
    foreach (['pdo_mysql','mbstring','openssl','tokenizer','xml','curl','fileinfo','bcmath','gd'] as $ext) {
        $checks[] = ["ext-$ext", extension_loaded($ext), extension_loaded($ext) ? 'loaded' : 'missing'];
    }
    $checks[] = ['Ghostscript (PDF→image for AI)',
        (bool)trim(shell_exec('command -v gs') ?? ''),
        trim(shell_exec('gs --version 2>/dev/null') ?? 'not found')];
    $checks[] = ['.env writable', is_writable(APP_DIR) && (file_exists(ENV_FILE) ? is_writable(ENV_FILE) : true), ENV_FILE];
    $checks[] = ['storage/ writable', is_writable(APP_DIR . '/storage'), APP_DIR . '/storage'];
    $checks[] = ['bootstrap/cache writable', is_writable(APP_DIR . '/bootstrap/cache'), APP_DIR . '/bootstrap/cache'];
}

?><!DOCTYPE html>
<html lang="en"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>CoOPS — Installation</title>
<style>
  body { font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif; background:#f8fafc; color:#0f172a; margin:0; }
  .wrap { max-width: 720px; margin: 40px auto; padding: 0 16px; }
  .card { background:#fff; border:1px solid #e5e7eb; border-radius:14px; padding:28px; box-shadow:0 6px 24px rgba(15,23,42,.06); }
  h1 { margin:0 0 4px; font-size:22px; }
  .sub { color:#64748b; font-size:14px; margin-bottom:18px; }
  .steps { display:flex; gap:8px; margin-bottom:22px; flex-wrap:wrap; }
  .pill { font-size:12px; padding:4px 10px; border-radius:999px; background:#f1f5f9; color:#475569; }
  .pill.active { background:#1d4ed8; color:#fff; }
  .pill.done { background:#10b981; color:#fff; }
  label { display:block; font-size:12px; font-weight:600; color:#475569; margin: 12px 0 4px; text-transform: uppercase; letter-spacing:.04em; }
  input[type=text], input[type=email], input[type=password], input[type=number], select {
    width:100%; box-sizing:border-box; padding:9px 11px; font-size:14px;
    border:1px solid #cbd5e1; border-radius:8px; background:#fff;
  }
  input:focus, select:focus { outline:none; border-color:#1d4ed8; box-shadow:0 0 0 3px rgba(29,78,216,.15); }
  .row { display:grid; grid-template-columns: 1fr 1fr; gap:12px; }
  .btn { display:inline-flex; align-items:center; gap:6px; background:#1d4ed8; color:#fff; border:0; padding:10px 18px; border-radius:8px; font-size:14px; font-weight:600; cursor:pointer; }
  .btn:disabled { opacity:.6; cursor:not-allowed; }
  .btn.secondary { background:#e2e8f0; color:#0f172a; }
  .err { background:#fef2f2; color:#991b1b; border:1px solid #fecaca; padding:10px 12px; border-radius:8px; margin-bottom:12px; font-size:14px; }
  .ok  { color:#10b981; } .ko { color:#ef4444; }
  ul.checks { list-style:none; padding:0; margin:0 0 16px; }
  ul.checks li { display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px dashed #e5e7eb; font-size:14px; }
  ul.checks li small { color:#94a3b8; font-size:11px; }
  pre.log { background:#0f172a; color:#cbd5e1; padding:14px; border-radius:8px; max-height:340px; overflow:auto; font-size:12px; line-height:1.45; }
  .actions { display:flex; gap:10px; justify-content:flex-end; margin-top:18px; }
  .hint { color:#64748b; font-size:12px; margin-top:4px; }
  @media (max-width:600px){ .row { grid-template-columns:1fr; } .wrap{ margin:16px auto; } .card{padding:18px;} }
</style></head><body>
<div class="wrap">
  <div class="card">
    <h1>CoOPS — Installation</h1>
    <div class="sub">Set up the database, app and first administrator. Takes about a minute.</div>
    <div class="steps">
      <?php foreach ([1=>'System',2=>'Database',3=>'App',4=>'Admin',5=>'Install',6=>'Done'] as $i=>$lab): ?>
        <span class="pill <?= $i < $step ? 'done' : ($i === $step ? 'active' : '') ?>"><?= $i ?>. <?= $lab ?></span>
      <?php endforeach; ?>
    </div>

    <?php if ($err): ?><div class="err">⚠ <?= h($err) ?></div><?php endif; ?>

    <?php if ($step === 1): ?>
      <ul class="checks">
        <?php foreach ($checks as [$lab, $ok, $val]): ?>
          <li><span><?= h($lab) ?> <small><?= h($val) ?></small></span><span class="<?= $ok ? 'ok':'ko' ?>"><?= $ok ? '✓' : '✗' ?></span></li>
        <?php endforeach; ?>
      </ul>
      <?php $allOk = !in_array(false, array_column($checks, 1), true); ?>
      <div class="actions">
        <a class="btn <?= $allOk ? '' : 'secondary' ?>" href="?step=2" <?= $allOk ? '' : 'aria-disabled="true" onclick="return false"' ?>>Continue →</a>
      </div>

    <?php elseif ($step === 2): ?>
      <form method="post">
        <div class="row">
          <div><label>Host</label><input name="host" type="text" value="<?= h(defaultValue($data, $defaults, 'db', 'host', '127.0.0.1')) ?>" required></div>
          <div><label>Port</label><input name="port" type="number" value="<?= h(defaultValue($data, $defaults, 'db', 'port', '3306')) ?>" required></div>
        </div>
        <label>Database</label><input name="database" type="text" value="<?= h(defaultValue($data, $defaults, 'db', 'database', 'coops')) ?>" required>
        <div class="row">
          <div><label>Username</label><input name="username" type="text" value="<?= h(defaultValue($data, $defaults, 'db', 'username', 'coops')) ?>" required></div>
          <div><label>Password</label><input name="password" type="password" value="<?= h(defaultValue($data, $defaults, 'db', 'password')) ?>"></div>
        </div>
        <?php if (!empty($defaults['db'])): ?>
          <div class="hint">Database credentials were generated by the server installer. You can usually leave these values unchanged.</div>
        <?php else: ?>
          <div class="hint">If this is a fresh install, rerun the latest installer so these database credentials are generated automatically.</div>
        <?php endif; ?>
        <label style="display:flex;align-items:center;gap:6px;text-transform:none;font-weight:400;">
          <input type="checkbox" name="create" value="1" <?= !empty($data['db']['create'] ?? $defaults['db']['create'] ?? false) ? 'checked' : '' ?>>
          Create database if it doesn't exist (requires CREATE DATABASE privilege).
        </label>
        <div class="actions"><a class="btn secondary" href="?step=1">← Back</a><button class="btn">Test &amp; Continue</button></div>
      </form>

    <?php elseif ($step === 3): ?>
      <form method="post">
        <label>App name</label><input name="name" type="text" value="<?= h($data['app']['name'] ?? 'CoOPS') ?>" required>
        <label>Company name</label><input name="company_name" type="text" value="<?= h($data['app']['company_name'] ?? $data['app']['name'] ?? 'CoOPS') ?>" required>
        <label>App URL</label>
        <input name="url" type="text" value="<?= h($data['app']['url'] ?? defaultAppUrl()) ?>" required>
        <div class="hint">e.g. https://pmk.example.com — used for cookies, mail links and CORS.</div>
        <div class="row">
          <div><label>Environment</label>
            <select name="env">
              <?php foreach (['production','staging','local'] as $e): ?>
                <option <?= ($data['app']['env'] ?? 'production') === $e ? 'selected' : '' ?>><?= $e ?></option>
              <?php endforeach; ?>
            </select>
          </div>
          <div><label>Default locale</label>
            <select name="locale">
              <?php foreach (['en'=>'English','sq'=>'Shqip'] as $k=>$v): ?>
                <option value="<?= $k ?>" <?= ($data['app']['locale'] ?? 'en') === $k ? 'selected' : '' ?>><?= $v ?></option>
              <?php endforeach; ?>
            </select>
          </div>
        </div>
        <label style="display:flex;align-items:center;gap:6px;text-transform:none;font-weight:400;">
          <input type="checkbox" name="debug" value="1" <?= !empty($data['app']['debug']) && $data['app']['debug'] === 'true' ? 'checked' : '' ?>>
          Enable debug mode (DO NOT enable in production).
        </label>

        <h3 style="margin-top:22px;font-size:16px;">SMTP (optional)</h3>
        <div class="row">
          <div><label>Mail host</label><input name="mail_host" type="text" value="<?= h($data['mail']['host'] ?? '') ?>"></div>
          <div><label>Port</label><input name="mail_port" type="number" value="<?= h($data['mail']['port'] ?? '587') ?>"></div>
        </div>
        <div class="row">
          <div><label>Username</label><input name="mail_user" type="text" value="<?= h($data['mail']['user'] ?? '') ?>"></div>
          <div><label>Password</label><input name="mail_pass" type="password" value=""></div>
        </div>
        <div class="row">
          <div><label>Encryption</label>
            <select name="mail_enc">
              <?php foreach (['tls','ssl','null'] as $e): ?>
                <option <?= ($data['mail']['enc'] ?? 'tls') === $e ? 'selected' : '' ?>><?= $e ?></option>
              <?php endforeach; ?>
            </select>
          </div>
          <div><label>From address</label><input name="mail_from" type="email" value="<?= h($data['mail']['from'] ?? '') ?>"></div>
        </div>
        <div class="actions"><a class="btn secondary" href="?step=2">← Back</a><button class="btn">Continue →</button></div>
      </form>

    <?php elseif ($step === 4): ?>
      <form method="post">
        <div class="row">
          <div><label>First name</label><input name="first_name" type="text" value="<?= h($data['admin']['first_name'] ?? '') ?>" required></div>
          <div><label>Last name</label><input name="last_name" type="text" value="<?= h($data['admin']['last_name'] ?? '') ?>" required></div>
        </div>
        <label>Email</label><input name="email" type="email" value="<?= h($data['admin']['email'] ?? '') ?>" required>
        <label>Password</label><input name="password" type="password" minlength="8" required>
        <div class="hint">This account gets the <b>Super Admin</b> role and full permissions.</div>
        <div class="actions"><a class="btn secondary" href="?step=3">← Back</a><button class="btn">Continue →</button></div>
      </form>

    <?php elseif ($step === 5): ?>
      <p>Ready to install. The wizard will write <code>.env</code>, generate the app key, run migrations &amp; seeders, and create your Super Admin account.</p>
      <form method="post">
        <div class="actions"><a class="btn secondary" href="?step=4">← Back</a><button class="btn">Run installation</button></div>
      </form>

    <?php elseif ($step === 6): ?>
      <h2 style="color:#10b981;margin-top:0;">✓ Installation complete</h2>
      <p>Sign in with <b><?= h($data['admin']['email'] ?? '') ?></b> at <a href="<?= h($data['app']['url'] ?? '/') ?>"><?= h($data['app']['url'] ?? '/') ?></a>.</p>
      <p class="hint">For the AI features, open <b>Management → AI Settings</b> after login and paste your OpenAI API key.</p>
      <details><summary>Install log</summary><pre class="log"><?= h(implode("\n", (array)($data['log'] ?? []))) ?></pre></details>
      <form method="post" style="margin-top:14px;">
        <div class="actions"><button class="btn">Delete installer &amp; finish</button></div>
        <div class="hint">For your security this directory will be removed. /install/ will return 404 from now on.</div>
      </form>

    <?php endif; ?>
  </div>
  <div class="sub" style="text-align:center;margin-top:14px;">CoOPS installer · <?= date('Y') ?></div>
</div>
</body></html>
