# CoOPS installer

A single-file bash installer + a 6-step web wizard. Brings a fresh Ubuntu /
Debian server from zero to a running CoOPS instance.

The installer files live in this repository under
[`coops-installer/`](https://github.com/agonmaloku-bit/coding/tree/main/coops-installer).

## One-line install on a fresh server

> **Workflow:** the repository is normally **private**. Before installing on a
> new server, flip it to **public** (Settings → General → Danger Zone →
> Change visibility → Public), run the install, then flip it back to private.

While the repo is public, no GitHub token is needed:

```bash
sudo apt-get update && sudo apt-get install -y git
git clone https://github.com/agonmaloku-bit/coding.git /tmp/coops
cd /tmp/coops/coops-installer
chmod +x coops-install.sh
sudo ./coops-install.sh install \
    --domain coops.example.com \
    --repo-app https://github.com/agonmaloku-bit/coding.git \
    --repo-app-subdir coops-app \
    --repo-ui  https://github.com/agonmaloku-bit/coding.git \
    --repo-ui-subdir coops-ui
```

Then open `http://coops.example.com/install/` and finish the 6-step wizard.

> The installer, backend, and UI are all stored in this same repository:
> `coops-installer/`, `coops-app/`, and `coops-ui/`.

### Alternative: download the script only

If you only want the script (you'll still need the `wizard/` folder next to
it before the install completes), grab it raw from GitHub:

```bash
wget -O coops-install.sh \
    https://raw.githubusercontent.com/agonmaloku-bit/coding/main/coops-installer/coops-install.sh
chmod +x coops-install.sh
# also fetch the wizard folder, e.g. via:
#   git clone --depth 1 https://github.com/agonmaloku-bit/coding.git /tmp/coops \
#     && cp -r /tmp/coops/coops-installer/wizard ./wizard
sudo ./coops-install.sh install \
    --domain coops.example.com \
    --repo-app https://github.com/agonmaloku-bit/coding.git \
    --repo-app-subdir coops-app \
    --repo-ui  https://github.com/agonmaloku-bit/coding.git \
    --repo-ui-subdir coops-ui
```

### Installing while the repo stays private

If you'd rather not toggle visibility, you can still install using a
fine-grained PAT with **Contents: Read-only** scoped to this repo, e.g.:

```bash
GH_TOKEN=ghp_your_readonly_token
git clone "https://agonmaloku-bit:${GH_TOKEN}@github.com/agonmaloku-bit/coding.git" /tmp/coops
```

> **Note** — the script needs the `wizard/` folder next to it. Either
> distribute the bundle as a tarball (`coops-installer.tar.gz`) and extract,
> or pass `--no-clone` along with already-deployed sources. The convenience
> tarball is built with `./build-bundle.sh`.

## Subcommands

```
sudo ./coops-install.sh install [flags]   # provision a new server
sudo ./coops-install.sh update            # git pull + rebuild + reload
sudo ./coops-install.sh status            # show service status / versions
sudo ./coops-install.sh self-update --self-url <url>
sudo ./coops-install.sh help
```

### Install flags

| Flag | Default | Purpose |
| --- | --- | --- |
| `--domain` | *(required)* | Hostname for the nginx vhost |
| `--app-dir` | `/home/coops/coops-app` | Backend dir |
| `--ui-dir`  | `/home/coops/coops-ui`  | UI source dir |
| `--repo-app` | — | Git URL of the backend (omit with `--no-clone`) |
| `--repo-app-subdir` | — | Backend path inside repo (for this repo: `coops-app`) |
| `--repo-ui`  | — | Git URL of the UI |
| `--repo-ui-subdir` | — | UI path inside repo (for this repo: `coops-ui`) |
| `--no-clone` | off | Skip cloning (sources are already on disk) |
| `--skip-os` | off | Skip apt / OS package installs |
| `--php` | `8.3` | PHP version to install |
| `--db-name` | `coops` | MariaDB database to create for the app |
| `--db-user` | `coops` | Least-privilege MariaDB user to create for the app |
| `--db-pass` | generated | MariaDB password; omit to generate a random one |

## What it does

| Phase | Action |
| --- | --- |
| OS | nginx, mariadb-server, ghostscript, imagemagick, ufw, git, unzip |
| PHP | installs **php8.3-fpm** + ext-mysql/mbstring/xml/curl/zip/gd/bcmath/intl/redis/soap/imagick; falls back through distro/PPA candidates when needed |
| Composer | installs to /usr/local/bin/composer |
| Node | NodeSource Node.js 20 |
| Docker | reuses existing Docker/Compose or installs them when ARBK is enabled |
| Database | creates the app database and a least-privilege MariaDB user, then pre-fills the wizard DB step |
| App | `git clone` backend & UI under `/home/coops/`, `composer install`, builds the Vite UI, copies `dist/*` to `public/` |
| ARBK scraper | reuses a healthy `arbk-scraper` container, or fetches/builds/starts it on `127.0.0.1:8181` if missing |
| Wizard | drops `wizard/index.php` into `public/install/` and chowns to www-data |
| Nginx | writes `/etc/nginx/sites-available/<domain>.conf`. Includes **`Cache-Control: no-store` for `/service-worker.js`** so iOS PWAs update reliably |

## ARBK scraper

The installer uses the Dockerized ARBK helper service for the backend lookup
endpoint. If an `arbk-scraper` container is already running and
`http://127.0.0.1:8181/health` is healthy, the installer reuses it. Otherwise it
fetches/builds the scraper under `/home/arbk-scraper` and starts it with Docker
Compose. The wizard writes `ARBK_SCRAPER_URL=http://127.0.0.1:8181` to the
Laravel `.env`.

```bash
sudo ./coops-install.sh install ... --capsolver-api-key 'optional-key'
```

Use `--skip-arbk` only if you intentionally do not want Docker/the ARBK lookup
service on that server. Set `--capsolver-api-key` if the target server needs
Turnstile solving.

## Web wizard (6 steps)

1. **System** — PHP version, extensions, Ghostscript, file permissions
2. **Database** — host/port/db/user/pass + optional "Create DB"
3. **App** — name, URL, env, locale, optional SMTP
4. **Admin** — first Super Admin (email, password ≥ 8 chars)
5. **Install** — writes `.env`, `key:generate`, `storage:link`, `migrate --force --seed`, creates Super Admin, caches config/route/view
6. **Done** — install log; **Delete installer** removes `/install/` (404 from then on)

## After install: AI features

OpenAI key is stored in DB, not `.env`. Sign in as the Super Admin → **Management → AI Settings** → paste key & pick a model (`gpt-4o-mini` is the default).

## Updates

```bash
sudo ./coops-install.sh update
```

Or manually:

```bash
cd /home/coops/coops-app && git pull && composer install --no-dev -o && php artisan migrate --force
cd /home/coops/coops-ui  && git pull && npm ci && npm run build
cp -r /home/coops/coops-ui/dist/* /home/coops/coops-app/public/
sudo systemctl reload php8.3-fpm
```

## Database wizard defaults

Fresh installs create a MariaDB database/user before the web wizard opens:

- database: `coops` by default
- username: `coops` by default
- password: generated unless `--db-pass` is supplied

The generated values are written to `storage/app/install-wizard.json`, and the
wizard reads them to pre-fill step 2. Leave **Create database** unchecked unless
you intentionally type root/admin database credentials.

## HTTPS

```bash
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d coops.example.com
```
