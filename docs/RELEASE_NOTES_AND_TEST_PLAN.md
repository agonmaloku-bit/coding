# PSM — Release Notes & Test Plan

Generated 2026-06-12. Covers the recent installer/branding/data-fix work and
what to verify on the new server before going live.

---

## TL;DR

- **Install path**: unchanged — `coops-install.sh install ...` + the 6-step web wizard at `/install/`.
- **Update path**: `cd /tmp/coops && sudo git pull --ff-only && cd /tmp/coops/coops-installer && sudo ./coops-install.sh update`. Anything else is **not** supported.
- **Do not** run `git pull` inside `/home/coops/coops-app` or `/home/coops/coops-ui`.
- **Do not** run `npm audit fix --force` on the server.
- After every update, in the browser: DevTools → Application → Service workers → **Unregister**, then hard reload.

---

## What changed (last 2 days)

### Branding
- Rebranded to **PSM — Platforma e Sistemit të Menaxhimit**.
- Sidebar shows "PSM" (commit `f42c801`).
- All favicons removed during install + every update (`9996b6d`).

### ARBK scraper
- Fixed language payload — request now sends `Gjuha: 'sq'` (`a93c11b`).
- CapSolver key read from `CAPSOLVER_API_KEY` env (`a316b01`).
- UI lookup uses runtime API URL (`49ad836`).

### Installer hardening
- `rsync --delete` preserves `.env`, `storage/`, `bootstrap/cache/`,
  `vendor/`, `node_modules/`, `public/install/`, `public/storage`
  (`183e3f3`, `aa30cb3`).
- `.env` is also backed up and restored around every sync (`0790250`).
- Wizard is restored automatically if `.env` is missing (`ececeb9`).
- Laravel runtime dirs are created and writable **before** `composer install`
  so post-autoload package discovery does not fail (`0574eb1`).
- Storage/bootstrap caches forced to `www-data:www-data` + setgid 2775,
  install user joined to the `www-data` group (`85c474b`, `f0ff68d`).
- Stale `bootstrap/cache/routes-v7.php` and friends are purged before
  `optimize:clear` to avoid 405s on routes that exist in code
  (`85c474b`, `af9908f`).
- Passport keys are pinned back to **600** (private) and **660** (public)
  after the bulk perm reset; otherwise the OAuth library refuses to load
  them and every authenticated request returns 500 (`39a7b17`).
- `php artisan storage:link` runs on install **and** on every update; the
  symlink is also excluded from `rsync --delete`, so user uploads keep
  working (`aa30cb3`).
- `mysqldump | gzip` runs before `migrate --force`; last 10 dumps kept in
  `/home/coops/backups/` (`f0ff68d`).
- `npm ci` falls back to `npm install` if the lockfile drifts (`f0ff68d`).
- Installer `status` shows PHP, Composer, Node, npm, Nginx, MariaDB,
  Ghostscript, Docker (`5fdb2ac`).

### Frontend
- Vendored `ScaleLoader.vue` locally to silence the
  `vue-spinner` keyframe CSS warnings — build is now clean (`2679528`).

### Schema fix
- New migration renames `suppliers.numri_biznesit` → `suppliers.bussines_no`
  on fresh installs (`eb9bc91`). Guarded; skipped on legacy installs and
  re-runs.

---

## Pre-go-live test plan

Run after a fresh install **and** after the next safe update on the live
server. Each block lists the user-visible behavior to confirm.

### 0. Smoke test (always first)

- `sudo ./coops-install.sh status` — every service must be `active`/`running`.
- Open `https://<domain>/` — login screen renders, no console errors.
- Open `/install/` — should be 404 (wizard removed itself after install).
- Hard-refresh and unregister the service worker.

### 1. Auth & permissions

- Log in as the Super Admin created by the wizard.
- Log out, log back in with a wrong password → expect a friendly error,
  not a 500. (If you see 500, check `storage/logs/laravel.log` — it is
  almost always perms on `oauth-public.key`. See "Recovery" below.)
- Open **Management → Users**, edit any user, save → no 500.
- Open **Management → Roles** → add a permission → save.

### 2. Companies

- Create a company **with a logo upload**. The logo must render in the
  company list and on contract/bill templates. (Tests
  `php artisan storage:link` + `public/storage` symlink.)
- Edit and re-upload the logo.
- Delete the company.

### 3. Suppliers

- Create a supplier with a numeric **bussines_no** (e.g. `810795297`).
  Must save without 500. (Tests the new rename migration.)
- Edit the supplier, change `bussines_no` to a new number.
- Try saving a duplicate `bussines_no` → expect a friendly validation
  error.

### 4. Departments

- Create, edit, delete a department under each company.

### 5. Contracts

- Create a contract with at least one attachment and a workflow.
- Walk the contract through every workflow step.
- Generate a PDF from a contract template — open it, verify logo and
  layout.

### 6. Bills

- Create a bill of type `Sherbim` with a supplier and an attachment.
- Approve / reject through the workflow.
- Download the generated bill PDF.

### 7. ARBK scraper

- In a company or supplier form, paste a real Kosovo business number,
  click ARBK lookup → fields populate from
  `http://127.0.0.1:8181`.
- `docker ps` shows `arbk-scraper` running.

### 8. PWA / service worker

- Install the app on a phone (Add to Home Screen).
- Trigger an update on the server, then open the installed PWA — within
  one cold start the new build loads.

### 9. Backups & recovery

- After an update, `ls -lh /home/coops/backups/` shows a new
  `coops-<timestamp>.sql.gz`.
- Manually verify a dump:
  `gunzip -c /home/coops/backups/<latest>.sql.gz | head -30`.

---

## Recovery commands (keep handy)

### "Dashboard 500s after update" — OAuth key perms

```bash
sudo chmod 600 /home/coops/coops-app/storage/oauth-private.key
sudo chmod 660 /home/coops/coops-app/storage/oauth-public.key
sudo systemctl reload php8.3-fpm
```

### "405 on POST /api/auth/login" — stale route cache

```bash
cd /home/coops/coops-app
sudo rm -f bootstrap/cache/{routes-v7.php,routes.php,config.php,packages.php,services.php,compiled.php,events.php}
sudo -u www-data php artisan optimize:clear
sudo -u www-data php artisan config:cache && sudo -u www-data php artisan route:cache && sudo -u www-data php artisan view:cache
sudo systemctl reload php8.3-fpm
```

### "Permission denied on storage/framework/cache/data" — rate limiter

```bash
sudo chown -R www-data:www-data /home/coops/coops-app/storage /home/coops/coops-app/bootstrap/cache
sudo find /home/coops/coops-app/storage /home/coops/coops-app/bootstrap/cache -type d -exec chmod 2775 {} \;
sudo find /home/coops/coops-app/storage /home/coops/coops-app/bootstrap/cache -type f -exec chmod 664 {} \;
sudo chmod 600 /home/coops/coops-app/storage/oauth-private.key
sudo chmod 660 /home/coops/coops-app/storage/oauth-public.key
```

### "Unknown column 'X'" — missing rename migration

If the live DB is older than this migration set, add a guarded rename in
a new migration file (`Schema::hasColumn(...) → renameColumn(...)`),
push, then `update`. Pattern in
[2026_06_12_140000_rename_numri_biznesit_to_bussines_no_on_suppliers.php](../coops-app/database/migrations/2026_06_12_140000_rename_numri_biznesit_to_bussines_no_on_suppliers.php).

### ".env missing"

Just run the update — installer restores `/install/` and asks you to
re-run the 6-step wizard. DB credentials are still in
`/home/coops/coops-app/storage/app/install-wizard.json`.

### Roll back a bad migration

```bash
cd /home/coops/coops-app
LATEST=$(ls -t /home/coops/backups/*.sql.gz | head -1)
gunzip -c "$LATEST" | sudo mysql coops
sudo -u www-data php artisan migrate:rollback --step=1
```

---

## Known cosmetic warnings (ignore)

- `npm warn deprecated bootstrap@3 / vue-i18n@9 / eslint@8 ...` — upstream
  dependency state, fix planned in a future frontend-deps PR.
- `npm audit` says 7 vulnerabilities — same; do not `--force`.
- Vite `(!) Some chunks are larger than 500 kB after minification` — UI
  build splitting is a future optimization.

---

## Suspected next bug (open)

UI form for **Bills** sends `files: [{}]` even when no file is attached,
which the backend rejects with `files.0 field is required`. Two fixes
possible (relax backend or stop sending the placeholder); needs a
look at `BillStoreRequest.php` and the bill form component to decide
which is correct. Tracked separately.
