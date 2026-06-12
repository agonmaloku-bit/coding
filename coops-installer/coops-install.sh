#!/usr/bin/env bash
# =============================================================================
# PSM — server provisioning script
# -----------------------------------------------------------------------------
# Brings a fresh Ubuntu 22.04 / 24.04 / Debian 12 server from zero to a working
# PSM installation. After the script finishes, open /install/ in a browser
# and complete the configuration wizard.
#
# Typical use (download once, then run):
#
#   wget -O coops-install.sh https://example.com/coops-install.sh
#   chmod +x coops-install.sh
#   sudo ./coops-install.sh install \
#       --domain coops.example.com \
#       --repo-app https://github.com/your-org/coops-app.git \
#       --repo-ui  https://github.com/your-org/coops-ui.git
#
# Subcommands:
#   install        Provision the server and deploy the app + wizard.
#   update         Pull latest code, rebuild UI, run migrations, reload php-fpm.
#   status         Print versions and service states.
#   self-update    Re-download this script from --self-url.
#   help           Show this help.
# =============================================================================
set -euo pipefail

# -------- defaults -----------------------------------------------------------
DOMAIN=""
APP_DIR="/home/coops/coops-app"
UI_DIR="/home/coops/coops-ui"
ARBK_DIR="/home/arbk-scraper"
INSTALL_USER="coops"
REPO_APP=""
REPO_UI=""
REPO_ARBK=""
REPO_APP_SUBDIR=""
REPO_UI_SUBDIR=""
REPO_ARBK_SUBDIR=""
NO_CLONE=0
SKIP_ARBK=0
SKIP_OS=0
PHP_VERSION="8.3"
PHP_VERSION_EXPLICIT=0
NODE_MAJOR="20"
WEB_USER="www-data"
SELF_URL=""
DB_NAME="coops"
DB_USER="coops"
DB_PASS=""
ARBK_SCRAPER_URL="http://127.0.0.1:8181"
CAPSOLVER_API_KEY="${CAPSOLVER_API_KEY:-}"

SUBCMD="${1:-help}"
[[ $# -gt 0 ]] && shift || true

# -------- helpers ------------------------------------------------------------
log()  { printf '\033[1;34m[psm]\033[0m %s\n' "$*"; }
warn() { printf '\033[1;33m[warn]\033[0m  %s\n' "$*"; }
fail() { printf '\033[1;31m[fail]\033[0m  %s\n' "$*"; exit 1; }

remove_favicon_assets() {
    local public_dir="$1"
    rm -f "$public_dir/favicon.ico"
    rm -f "$public_dir/manifest.json" "$public_dir/precache-manifest"*.js 2>/dev/null || true
    rm -f "$public_dir/img/icons/favicon-16x16.png" "$public_dir/img/icons/favicon-32x32.png"
    rm -f "$public_dir/img/icons/apple-touch-icon.png" "$public_dir/img/icons/apple-touch-icon-152x152.png" "$public_dir/img/icons/apple-touch-icon-167x167.png"
    rm -f "$public_dir/img/icons/android-chrome-"*.png "$public_dir/img/icons/msapplication-icon-144x144.png" 2>/dev/null || true
}

usage() {
    cat <<EOF
PSM installer

Usage:
  $0 install     [flags]      Fresh install
  $0 update                   Pull & redeploy on an existing install
  $0 status                   Show service / version status
  $0 self-update              Re-download this script
  $0 help                     This message

Flags (install):
  --domain <host>             Hostname for the nginx vhost (required)
  --app-dir <path>            Backend dir       [default: $APP_DIR]
  --ui-dir  <path>            UI source dir     [default: $UI_DIR]
  --arbk-dir <path>           ARBK scraper dir  [default: $ARBK_DIR]
  --repo-app <git-url>        Backend repo URL
  --repo-ui  <git-url>        UI repo URL
  --repo-arbk <git-url>       ARBK scraper repo URL [default: --repo-app]
  --repo-app-subdir <path>    Backend path inside repo (monorepo installs)
  --repo-ui-subdir  <path>    UI path inside repo (monorepo installs)
  --repo-arbk-subdir <path>   ARBK path inside repo [default: coops-arbk-scraper]
  --no-clone                  Skip git clone (sources already on disk)
  --skip-arbk                 Do not install/start Dockerized ARBK scraper
  --skip-os                   Skip apt / OS package install
  --php <ver>                 PHP version  [default: $PHP_VERSION]
  --db-name <name>            Database name [default: $DB_NAME]
  --db-user <user>            Database user [default: $DB_USER]
  --db-pass <pass>            Database password [default: generated]
  --arbk-url <url>            Backend ARBK scraper URL [default: $ARBK_SCRAPER_URL]
  --capsolver-api-key <key>   Optional ARBK Turnstile solving API key
  --self-url <url>            Source URL for 'self-update' subcommand
EOF
}

# -------- args ---------------------------------------------------------------
while [[ $# -gt 0 ]]; do
    case "$1" in
        --domain)    DOMAIN="$2"; shift 2 ;;
        --app-dir)   APP_DIR="$2"; shift 2 ;;
        --ui-dir)    UI_DIR="$2"; shift 2 ;;
        --arbk-dir)  ARBK_DIR="$2"; shift 2 ;;
        --repo-app)  REPO_APP="$2"; shift 2 ;;
        --repo-ui)   REPO_UI="$2"; shift 2 ;;
        --repo-arbk) REPO_ARBK="$2"; shift 2 ;;
        --repo-app-subdir) REPO_APP_SUBDIR="$2"; shift 2 ;;
        --repo-ui-subdir)  REPO_UI_SUBDIR="$2"; shift 2 ;;
        --repo-arbk-subdir) REPO_ARBK_SUBDIR="$2"; shift 2 ;;
        --no-clone)  NO_CLONE=1; shift ;;
        --skip-arbk) SKIP_ARBK=1; shift ;;
        --skip-os)   SKIP_OS=1; shift ;;
        --php)       PHP_VERSION="$2"; PHP_VERSION_EXPLICIT=1; shift 2 ;;
        --db-name)   DB_NAME="$2"; shift 2 ;;
        --db-user)   DB_USER="$2"; shift 2 ;;
        --db-pass)   DB_PASS="$2"; shift 2 ;;
        --arbk-url)  ARBK_SCRAPER_URL="$2"; shift 2 ;;
        --capsolver-api-key) CAPSOLVER_API_KEY="$2"; shift 2 ;;
        --self-url)  SELF_URL="$2"; shift 2 ;;
        -h|--help)   usage; exit 0 ;;
        *) fail "Unknown option: $1" ;;
    esac
done

require_root() { [[ $EUID -eq 0 ]] || fail "must run as root (use sudo)"; }

validate_mysql_name() {
    [[ "$1" =~ ^[A-Za-z0-9_]+$ ]] || fail "$2 may only contain letters, numbers, and underscores"
}

validate_db_password() {
    [[ "$1" =~ ^[A-Za-z0-9_.@%+=:-]+$ ]] || fail "--db-pass contains unsupported characters; use letters, numbers, or _.@%+=:-"
}

apt_package_available() {
    apt-cache show "$1" >/dev/null 2>&1
}

sql_string() {
    local value="$1"
    value="${value//\\/\\\\}"
    value="${value//\'/\'\'}"
    printf "'%s'" "$value"
}

mysql_root_exec() {
    if command -v mariadb >/dev/null 2>&1; then
        mariadb --protocol=socket -uroot -e "$1"
    else
        mysql --protocol=socket -uroot -e "$1"
    fi
}

provision_database() {
    validate_mysql_name "$DB_NAME" "--db-name"
    validate_mysql_name "$DB_USER" "--db-user"

    if [[ -z "$DB_PASS" ]]; then
        DB_PASS="$(openssl rand -hex 18)"
    fi
    validate_db_password "$DB_PASS"

    log "Creating MariaDB database/user for wizard defaults..."
    systemctl enable --now mariadb

    local pass_sql
    pass_sql="$(sql_string "$DB_PASS")"
    mysql_root_exec "CREATE DATABASE IF NOT EXISTS \`$DB_NAME\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
    mysql_root_exec "CREATE USER IF NOT EXISTS '$DB_USER'@'localhost' IDENTIFIED BY $pass_sql; ALTER USER '$DB_USER'@'localhost' IDENTIFIED BY $pass_sql; GRANT ALL PRIVILEGES ON \`$DB_NAME\`.* TO '$DB_USER'@'localhost';"
    mysql_root_exec "CREATE USER IF NOT EXISTS '$DB_USER'@'127.0.0.1' IDENTIFIED BY $pass_sql; ALTER USER '$DB_USER'@'127.0.0.1' IDENTIFIED BY $pass_sql; GRANT ALL PRIVILEGES ON \`$DB_NAME\`.* TO '$DB_USER'@'127.0.0.1';"
    mysql_root_exec "FLUSH PRIVILEGES;"
}

backup_database() {
    # Best-effort mysqldump before migrate. Reads DB credentials from .env.
    # On failure (no mysqldump, unreadable .env, dump error) we warn and continue,
    # because update should not be blocked by an optional safety net.
    local env_file="$APP_DIR/.env"
    [[ -r "$env_file" ]] || { warn "Cannot read $env_file; skipping pre-migrate DB backup."; return 0; }
    command -v mysqldump >/dev/null 2>&1 || { warn "mysqldump not available; skipping pre-migrate DB backup."; return 0; }

    local db_host db_port db_name db_user db_pass
    db_host=$(grep -E '^DB_HOST=' "$env_file" | head -n1 | cut -d= -f2- | tr -d '"' | tr -d "'")
    db_port=$(grep -E '^DB_PORT=' "$env_file" | head -n1 | cut -d= -f2- | tr -d '"' | tr -d "'")
    db_name=$(grep -E '^DB_DATABASE=' "$env_file" | head -n1 | cut -d= -f2- | tr -d '"' | tr -d "'")
    db_user=$(grep -E '^DB_USERNAME=' "$env_file" | head -n1 | cut -d= -f2- | tr -d '"' | tr -d "'")
    db_pass=$(grep -E '^DB_PASSWORD=' "$env_file" | head -n1 | cut -d= -f2- | tr -d '"' | tr -d "'")
    [[ -n "$db_name" && -n "$db_user" ]] || { warn "DB credentials missing in .env; skipping pre-migrate DB backup."; return 0; }

    local backup_dir="/home/$INSTALL_USER/backups"
    mkdir -p "$backup_dir"
    chown "$INSTALL_USER":"$INSTALL_USER" "$backup_dir"
    chmod 750 "$backup_dir"
    local stamp="$(date +%Y%m%d-%H%M%S)"
    local out="$backup_dir/${db_name}-${stamp}.sql.gz"
    log "Backing up database '$db_name' to $out ..."
    if MYSQL_PWD="$db_pass" mysqldump --single-transaction --quick --routines --triggers \
        -h "${db_host:-127.0.0.1}" -P "${db_port:-3306}" -u "$db_user" "$db_name" 2>/dev/null | gzip > "$out"; then
        chown "$INSTALL_USER":"$INSTALL_USER" "$out"
        chmod 640 "$out"
        # Keep last 10 backups
        ls -1t "$backup_dir"/*.sql.gz 2>/dev/null | tail -n +11 | xargs -r rm -f
    else
        rm -f "$out"
        warn "mysqldump failed; continuing without a fresh backup. Check credentials in .env."
    fi
}

prepare_passport_keys() {
    [[ -d "$APP_DIR/vendor/laravel/passport" ]] || return 0

    if [[ ! -f "$APP_DIR/storage/oauth-private.key" || ! -f "$APP_DIR/storage/oauth-public.key" ]]; then
        log "Preparing Passport OAuth keys..."
        if ! sudo -H -u "$WEB_USER" bash -c "cd '$APP_DIR' && php artisan passport:keys --force"; then
            warn "Passport keys could not be generated yet; the web installer will retry after .env is configured."
        fi
    fi

    if [[ -f "$APP_DIR/storage/oauth-private.key" && -f "$APP_DIR/storage/oauth-public.key" ]]; then
        chown "$WEB_USER":"$WEB_USER" "$APP_DIR/storage/oauth-private.key" "$APP_DIR/storage/oauth-public.key"
        chmod 600 "$APP_DIR/storage/oauth-private.key"
        chmod 660 "$APP_DIR/storage/oauth-public.key"
    fi
}

docker_compose_cmd() {
    if docker compose version >/dev/null 2>&1; then
        echo "docker compose"
    elif command -v docker-compose >/dev/null 2>&1; then
        echo "docker-compose"
    else
        return 1
    fi
}

arbk_container_running() {
    command -v docker >/dev/null 2>&1 || return 1
    [[ "$(docker inspect -f '{{.State.Running}}' arbk-scraper 2>/dev/null || true)" == "true" ]]
}

arbk_health_ok() {
    curl -fsS --max-time 15 "$ARBK_SCRAPER_URL/health" >/dev/null 2>&1
}

install_arbk_scraper() {
    [[ $SKIP_ARBK -eq 1 ]] && { warn "Skipping ARBK scraper install."; return 0; }

    if arbk_container_running && arbk_health_ok; then
        log "Existing ARBK scraper is already running and healthy at $ARBK_SCRAPER_URL."
        return 0
    fi

    if [[ -z "$REPO_ARBK" ]]; then
        REPO_ARBK="$REPO_APP"
    fi
    if [[ -z "$REPO_ARBK_SUBDIR" && -n "$REPO_ARBK" ]]; then
        REPO_ARBK_SUBDIR="coops-arbk-scraper"
    fi

    if [[ $NO_CLONE -eq 0 && -n "$REPO_ARBK" ]]; then
        checkout_source "$REPO_ARBK" "$ARBK_DIR" "$REPO_ARBK_SUBDIR" "ARBK scraper"
    elif [[ $NO_CLONE -eq 0 && -d "$ARBK_DIR/.git" ]]; then
        warn "$ARBK_DIR exists, pulling"
        sudo -H -u "$INSTALL_USER" git -C "$ARBK_DIR" pull --ff-only
    elif [[ $NO_CLONE -eq 0 && -f "$ARBK_DIR/.coops-source-url" && -f "$ARBK_DIR/.coops-source-subdir" ]]; then
        checkout_source "$(cat "$ARBK_DIR/.coops-source-url")" "$ARBK_DIR" "$(cat "$ARBK_DIR/.coops-source-subdir")" "ARBK scraper"
    elif [[ $NO_CLONE -eq 0 ]]; then
        fail "--repo-arbk is required for ARBK scraper install (or pass --skip-arbk)"
    fi

    [[ -f "$ARBK_DIR/docker-compose.yml" ]] || fail "ARBK docker-compose.yml missing: $ARBK_DIR/docker-compose.yml"

    cat > "$ARBK_DIR/.env" <<EOF
CAPSOLVER_API_KEY=$CAPSOLVER_API_KEY
EOF
    chown "$INSTALL_USER":"$INSTALL_USER" "$ARBK_DIR/.env"
    chmod 600 "$ARBK_DIR/.env"

    systemctl enable --now docker
    usermod -aG docker "$INSTALL_USER" || true

    local compose_cmd
    compose_cmd="$(docker_compose_cmd)" || fail "Docker Compose is not available after Docker install"

    log "Starting ARBK scraper with Docker Compose..."
    (cd "$ARBK_DIR" && $compose_cmd up -d --build)

    if curl -fsS --max-time 15 "$ARBK_SCRAPER_URL/health" >/dev/null; then
        log "ARBK scraper is healthy at $ARBK_SCRAPER_URL."
    else
        warn "ARBK scraper container started, but health check failed at $ARBK_SCRAPER_URL/health. Check: cd $ARBK_DIR && $compose_cmd logs"
    fi
}

# -------- subcommand: status -------------------------------------------------
do_status() {
    log "PHP:        $(php -v 2>/dev/null | head -1 || echo 'not installed')"
    log "Composer:   $(composer --version 2>/dev/null || echo 'not installed')"
    log "Node:       $(node -v 2>/dev/null || echo 'not installed')"
    log "npm:        $(npm -v 2>/dev/null || echo 'not installed')"
    log "Nginx:      $(nginx -v 2>&1 || echo 'not installed')"
    log "MariaDB:    $(mariadb --version 2>/dev/null || mysql --version 2>/dev/null || echo 'not installed')"
    log "Ghostscript:$(gs --version 2>/dev/null || echo 'not installed')"
    log "Docker:     $(docker --version 2>/dev/null || echo 'not installed')"
    for s in nginx php${PHP_VERSION}-fpm mariadb; do
        printf '\033[1;34m[psm]\033[0m %-20s %s\n' "$s" \
            "$(systemctl is-active "$s" 2>/dev/null || echo 'inactive')"
    done
    if command -v docker >/dev/null 2>&1; then
        printf '\033[1;34m[psm]\033[0m %-20s %s\n' "arbk-scraper" \
            "$(docker inspect -f '{{.State.Status}}' arbk-scraper 2>/dev/null || echo 'not installed')"
    fi
}

# -------- subcommand: self-update -------------------------------------------
do_self_update() {
    [[ -z "$SELF_URL" ]] && fail "Pass --self-url <url> to self-update"
    require_root
    local tmp
    tmp="$(mktemp)"
    log "Downloading $SELF_URL ..."
    wget -qO "$tmp" "$SELF_URL"
    chmod +x "$tmp"
    bash -n "$tmp" || { rm -f "$tmp"; fail "downloaded script failed syntax check"; }
    mv "$tmp" "$0"
    log "Updated $0"
}

checkout_source() {
    local repo="$1"
    local dest="$2"
    local subdir="${3:-}"
    local label="$4"

    if [[ -z "$subdir" ]]; then
        if [[ ! -d "$dest/.git" ]]; then
            log "Cloning $label into $dest ..."
            rm -rf "$dest"
            sudo -H -u "$INSTALL_USER" git clone "$repo" "$dest"
        else
            warn "$dest exists, pulling"
            sudo -H -u "$INSTALL_USER" git -C "$dest" pull --ff-only
        fi
        return
    fi

    local tmp
    tmp="$(mktemp -d)"
    log "Fetching $label from $repo:$subdir ..."
    chown "$INSTALL_USER":"$INSTALL_USER" "$tmp"
    sudo -H -u "$INSTALL_USER" git clone --depth 1 "$repo" "$tmp"
    [[ -d "$tmp/$subdir" ]] || { rm -rf "$tmp"; fail "Subdirectory not found in repo: $subdir"; }

    local env_backup=""
    if [[ -f "$dest/.env" ]]; then
        env_backup="$(mktemp)"
        cp "$dest/.env" "$env_backup"
    fi

    mkdir -p "$dest"
    # NOTE: vendor/ and node_modules/ are excluded so updates are incremental
    # (otherwise rsync --delete wipes them and composer/npm reinstall every package
    # on every update, leaving a small window where the app is broken).
    # public/storage is the symlink to storage/app/public — wiping it breaks all
    # user-uploaded files (company logos, contract templates, etc.).
    rsync -a --delete \
        --exclude '.git' \
        --exclude '.env' \
        --exclude 'storage/' \
        --exclude 'bootstrap/cache/' \
        --exclude 'vendor/' \
        --exclude 'node_modules/' \
        --exclude 'public/install/' \
        --exclude 'public/storage' \
        --exclude 'public/storage/' \
        "$tmp/$subdir/" "$dest/"
    if [[ -n "$env_backup" ]]; then
        cp "$env_backup" "$dest/.env"
        rm -f "$env_backup"
    fi
    chown -R "$INSTALL_USER":"$INSTALL_USER" "$dest"
    printf '%s\n' "$repo" > "$dest/.coops-source-url"
    printf '%s\n' "$subdir" > "$dest/.coops-source-subdir"
    chown "$INSTALL_USER":"$INSTALL_USER" "$dest/.coops-source-url" "$dest/.coops-source-subdir"
    rm -rf "$tmp"
}

# -------- subcommand: update -------------------------------------------------
do_update() {
    require_root

    log "Pulling backend..."
    if [[ -d "$APP_DIR/.git" ]]; then
        sudo -H -u "$INSTALL_USER" git -C "$APP_DIR" pull --ff-only
    elif [[ -f "$APP_DIR/.coops-source-url" && -f "$APP_DIR/.coops-source-subdir" ]]; then
        checkout_source "$(cat "$APP_DIR/.coops-source-url")" "$APP_DIR" "$(cat "$APP_DIR/.coops-source-subdir")" "backend"
    else
        fail "$APP_DIR is not a git checkout and has no PSM source metadata"
    fi
    if [[ ! -f "$APP_DIR/.env" ]]; then
        WIZARD_DST="$APP_DIR/public/install"
        SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
        log "Restoring web wizard at $WIZARD_DST ..."
        mkdir -p "$WIZARD_DST"
        if [[ -d "$SCRIPT_DIR/wizard" ]]; then
            cp "$SCRIPT_DIR/wizard/index.php" "$WIZARD_DST/index.php"
            cp "$SCRIPT_DIR/wizard/.htaccess" "$WIZARD_DST/.htaccess" 2>/dev/null || true
        else
            cat > "$WIZARD_DST/index.php" <<'PHP'
<?php echo "Wizard payload missing — please re-download installer with the wizard/ folder."; ?>
PHP
        fi
        chown -R "$WEB_USER":"$WEB_USER" "$WIZARD_DST"
        fail "$APP_DIR/.env is missing. Open /install/ to recreate the app configuration, then rerun update."
    fi
    sudo -H -u "$INSTALL_USER" bash -c "cd '$APP_DIR' && composer install --no-interaction --no-dev --prefer-dist --optimize-autoloader"

    log "Resetting storage and bootstrap/cache permissions..."
    mkdir -p "$APP_DIR/storage/framework/"{cache/data,sessions,views} "$APP_DIR/storage/logs" "$APP_DIR/bootstrap/cache"
    chown -R "$WEB_USER":"$WEB_USER" "$APP_DIR/storage" "$APP_DIR/bootstrap/cache"
    find "$APP_DIR/storage" "$APP_DIR/bootstrap/cache" -type d -exec chmod 2775 {} \;
    find "$APP_DIR/storage" "$APP_DIR/bootstrap/cache" -type f -exec chmod 664 {} \;

    log "Clearing Laravel caches..."
    rm -f "$APP_DIR/bootstrap/cache/"{routes-v7.php,routes.php,config.php,packages.php,services.php,compiled.php,events.php}
    sudo -u "$WEB_USER" -E bash -c "cd '$APP_DIR' && php artisan optimize:clear" || \
        sudo -u "$WEB_USER" -E bash -c "cd '$APP_DIR' && php artisan config:clear && php artisan route:clear && php artisan view:clear && php artisan cache:clear" || true

    log "Ensuring storage symlink..."
    mkdir -p "$APP_DIR/storage/app/public"
    if [[ ! -L "$APP_DIR/public/storage" && ! -e "$APP_DIR/public/storage" ]]; then
        sudo -u "$WEB_USER" -E bash -c "cd '$APP_DIR' && php artisan storage:link" || \
            ln -sfn "$APP_DIR/storage/app/public" "$APP_DIR/public/storage"
    fi

    backup_database
    sudo -u "$WEB_USER" -E bash -c "cd '$APP_DIR' && php artisan migrate --force"

    log "Rebuilding UI..."
    if [[ -d "$UI_DIR/.git" ]]; then
        sudo -H -u "$INSTALL_USER" git -C "$UI_DIR" pull --ff-only
    elif [[ -f "$UI_DIR/.coops-source-url" && -f "$UI_DIR/.coops-source-subdir" ]]; then
        checkout_source "$(cat "$UI_DIR/.coops-source-url")" "$UI_DIR" "$(cat "$UI_DIR/.coops-source-subdir")" "UI"
    else
        fail "$UI_DIR is not a git checkout and has no PSM source metadata"
    fi
    sudo -H -u "$INSTALL_USER" bash -c "cd '$UI_DIR' && (test -f package-lock.json && npm ci || npm install) && npm run build"
    remove_favicon_assets "$APP_DIR/public"
    cp -r "$UI_DIR"/dist/* "$APP_DIR/public/"
    remove_favicon_assets "$APP_DIR/public"
    chown -R "$WEB_USER":"$WEB_USER" "$APP_DIR/public"

    log "Rebuilding Laravel caches for production..."
    sudo -u "$WEB_USER" -E bash -c "cd '$APP_DIR' && php artisan config:cache && php artisan route:cache && php artisan view:cache" || \
        warn "Laravel cache rebuild failed; running uncached. Check storage/logs/laravel.log."

    log "Reloading php-fpm..."
    systemctl reload "php${PHP_VERSION}-fpm" || systemctl restart "php${PHP_VERSION}-fpm"

    if [[ $SKIP_ARBK -eq 0 && -d "$ARBK_DIR" ]]; then
        install_arbk_scraper
    fi

    log "Update done."
}

# -------- subcommand: install -----------------------------------------------
do_install() {
    require_root
    [[ -z "$DOMAIN" ]] && fail "--domain is required"

    # 1. OS packages
    if [[ $SKIP_OS -eq 0 ]]; then
        log "Updating apt and installing base packages..."
        export DEBIAN_FRONTEND=noninteractive
        apt-get update -y

        if [[ "$(. /etc/os-release && echo "$ID")" == "ubuntu" ]]; then
            add-apt-repository -y universe >/dev/null 2>&1 || true
            apt-get update -y
        fi

        apt-get install -y --no-install-recommends \
            ca-certificates curl wget gnupg lsb-release software-properties-common \
            git unzip zip rsync sudo \
            nginx mariadb-server \
            ghostscript imagemagick ufw

        if [[ $SKIP_ARBK -eq 0 ]]; then
            if command -v docker >/dev/null 2>&1; then
                log "Docker is already installed."
            else
                apt-get install -y --no-install-recommends docker.io
            fi

            if docker_compose_cmd >/dev/null 2>&1; then
                log "Docker Compose is already installed."
            elif apt_package_available docker-compose-plugin; then
                apt-get install -y --no-install-recommends docker-compose-plugin
            elif apt_package_available docker-compose; then
                apt-get install -y --no-install-recommends docker-compose
            else
                warn "Docker Compose package is not available from apt; ARBK scraper startup may fail."
            fi
        fi

        # Pick the best available PHP version:
        #   1. If user pinned --php, honor it (try repo + retry).
        #   2. Else, if the distro already provides php>=8.2 (e.g. Ubuntu 24.04
        #      ships php8.3), skip the third-party repo and use the distro one.
        #   3. Else, add ondrej/sury PPA for $PHP_VERSION (default 8.2).
        distro_php_candidate() {
            # Print best distro-provided php version (e.g. 8.3) or empty.
            for v in 8.4 8.3 8.2; do
                if apt_package_available "php${v}-fpm"; then
                    echo "$v"; return 0
                fi
            done
            return 1
        }

        if [[ $PHP_VERSION_EXPLICIT -eq 0 ]]; then
            distro_php="$(distro_php_candidate || true)"
            if [[ -n "$distro_php" ]]; then
                PHP_VERSION="$distro_php"
                log "Using distro-provided PHP ${PHP_VERSION} (no third-party repo needed)."
            elif [[ "$(. /etc/os-release && echo "$ID:$VERSION_CODENAME")" == "ubuntu:noble" ]]; then
                PHP_VERSION="8.3"
                log "Using Ubuntu 24.04 default PHP ${PHP_VERSION}."
            fi
        fi

        # If we still need a non-distro PHP, add the third-party repo.
        if ! apt_package_available "php${PHP_VERSION}-fpm"; then
            log "Adding PHP ${PHP_VERSION} repository..."
            ensure_php_repo() {
                if [[ "$(. /etc/os-release && echo "$ID")" == "ubuntu" ]]; then
                    # Wipe any half-added PPA that has no working data
                    rm -f /etc/apt/sources.list.d/*ondrej*ubuntu-php*.list \
                          /etc/apt/sources.list.d/*ondrej*ubuntu-php*.sources 2>/dev/null || true
                    add-apt-repository -y ppa:ondrej/php
                else
                    curl -sSLo /tmp/sury.deb https://packages.sury.org/debsuryorg-archive-keyring.deb
                    dpkg -i /tmp/sury.deb
                    echo "deb [signed-by=/usr/share/keyrings/deb.sury.org-php.gpg] https://packages.sury.org/php/ $(lsb_release -sc) main" \
                        > /etc/apt/sources.list.d/php.list
                fi
                apt-get update -y
            }

            attempts=0
            while : ; do
                ensure_php_repo || true
                if apt_package_available "php${PHP_VERSION}-fpm"; then
                    break
                fi
                attempts=$((attempts+1))
                if [[ $attempts -ge 3 ]]; then
                    # Last-resort fallback: if any distro PHP is available, use it.
                    distro_php="$(distro_php_candidate || true)"
                    if [[ -n "$distro_php" && $PHP_VERSION_EXPLICIT -eq 0 ]]; then
                        warn "Could not reach the PHP PPA. Falling back to distro PHP ${distro_php}."
                        PHP_VERSION="$distro_php"
                        break
                    fi
                    fail "php${PHP_VERSION}-fpm is still not available after 3 attempts. The PHP repository (ppa:ondrej/php on Ubuntu, packages.sury.org on Debian) is not reachable from this server, and the distro does not provide PHP ${PHP_VERSION}. Either fix outbound HTTPS to ppa.launchpadcontent.net / packages.sury.org, or pass --php <version> matching what the distro offers."
                fi
                warn "PHP repo not reachable yet (attempt $attempts/3) — retrying in 10s..."
                sleep 10
            done
        fi

        log "Installing PHP ${PHP_VERSION} + extensions..."
        apt-get install -y --no-install-recommends \
            php${PHP_VERSION}-fpm php${PHP_VERSION}-cli \
            php${PHP_VERSION}-mysql php${PHP_VERSION}-mbstring php${PHP_VERSION}-xml \
            php${PHP_VERSION}-curl php${PHP_VERSION}-zip php${PHP_VERSION}-gd \
            php${PHP_VERSION}-bcmath php${PHP_VERSION}-intl php${PHP_VERSION}-redis \
            php${PHP_VERSION}-soap php${PHP_VERSION}-imagick

        if ! command -v composer >/dev/null 2>&1; then
            log "Installing Composer..."
            curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer
        fi

        if ! command -v node >/dev/null 2>&1 || \
           [[ "$(node -v 2>/dev/null | cut -dv -f2 | cut -d. -f1)" -lt "$NODE_MAJOR" ]]; then
            log "Installing Node.js ${NODE_MAJOR}.x..."
            curl -fsSL "https://deb.nodesource.com/setup_${NODE_MAJOR}.x" | bash -
            apt-get install -y --no-install-recommends nodejs
        fi

        # ImageMagick: unblock PDF policy if set to 'none'
        if [[ -f /etc/ImageMagick-6/policy.xml ]]; then
            sed -i 's|<policy domain="coder" rights="none" pattern="PDF"|<policy domain="coder" rights="read|write" pattern="PDF"|' \
                /etc/ImageMagick-6/policy.xml || true
        fi
    fi

    # 2. system user
    if ! id "$INSTALL_USER" >/dev/null 2>&1; then
        log "Creating system user '$INSTALL_USER'..."
        useradd -m -s /bin/bash "$INSTALL_USER"
    fi
    usermod -aG "$WEB_USER" "$INSTALL_USER" || true
    usermod -aG "$INSTALL_USER" "$WEB_USER" || true
    chmod o+x "/home/$INSTALL_USER" || true

    # 3. fetch source
    if [[ $NO_CLONE -eq 0 ]]; then
        [[ -z "$REPO_APP" || -z "$REPO_UI" ]] && fail "--repo-app and --repo-ui are required (or pass --no-clone)"
        mkdir -p "$(dirname "$APP_DIR")" "$(dirname "$UI_DIR")"
        chown -R "$INSTALL_USER":"$INSTALL_USER" "$(dirname "$APP_DIR")" "$(dirname "$UI_DIR")"

        checkout_source "$REPO_APP" "$APP_DIR" "$REPO_APP_SUBDIR" "backend"
        checkout_source "$REPO_UI" "$UI_DIR" "$REPO_UI_SUBDIR" "UI"
    fi
    [[ -d "$APP_DIR" ]] || fail "Backend directory missing: $APP_DIR"
    [[ -d "$UI_DIR"  ]] || fail "UI directory missing: $UI_DIR"
    chgrp "$INSTALL_USER" "$APP_DIR" || true
    chmod 775 "$APP_DIR" || true

    install_arbk_scraper

    provision_database

    # 4. Laravel runtime directories must exist before Composer runs
    # because post-autoload scripts call Artisan package discovery. The setgid
    # bit ensures files dropped by either the install user or PHP-FPM keep
    # group ownership and stay writable on subsequent updates.
    log "Preparing storage / bootstrap cache..."
    mkdir -p "$APP_DIR/storage/framework/"{cache/data,sessions,views} "$APP_DIR/storage/logs" "$APP_DIR/bootstrap/cache"
    chown -R "$WEB_USER":"$WEB_USER" "$APP_DIR/storage" "$APP_DIR/bootstrap/cache"
    find "$APP_DIR/storage" "$APP_DIR/bootstrap/cache" -type d -exec chmod 2775 {} \;
    find "$APP_DIR/storage" "$APP_DIR/bootstrap/cache" -type f -exec chmod 664 {} \;
    usermod -aG "$WEB_USER" "$INSTALL_USER" || true

    # 5. backend deps
    log "Installing backend composer dependencies..."
    sudo -H -u "$INSTALL_USER" bash -c "cd '$APP_DIR' && composer install --no-interaction --prefer-dist --optimize-autoloader"

    if [[ ! -f "$APP_DIR/.env" ]]; then
        log "Creating empty .env (wizard will populate it)..."
        cp "$APP_DIR/.env.example" "$APP_DIR/.env" 2>/dev/null || touch "$APP_DIR/.env"
    fi
    chown "$WEB_USER":"$WEB_USER" "$APP_DIR/.env"
    chmod 664 "$APP_DIR/.env"

    prepare_passport_keys

    mkdir -p "$APP_DIR/storage/app"
    cat > "$APP_DIR/storage/app/install-wizard.json" <<JSON
{
    "db": {
        "host": "127.0.0.1",
        "port": "3306",
        "database": "$DB_NAME",
        "username": "$DB_USER",
        "password": "$DB_PASS",
        "create": false
    },
    "arbk": {
        "url": "$ARBK_SCRAPER_URL"
    }
}
JSON
    chown "$WEB_USER":"$WEB_USER" "$APP_DIR/storage/app" "$APP_DIR/storage/app/install-wizard.json"
    chmod 660 "$APP_DIR/storage/app/install-wizard.json"

    # 6. UI build
    log "Building UI..."
    sudo -H -u "$INSTALL_USER" bash -c "cd '$UI_DIR' && (test -f package-lock.json && npm ci || npm install) && npm run build"
    mkdir -p "$APP_DIR/public"
    remove_favicon_assets "$APP_DIR/public"
    cp -r "$UI_DIR"/dist/* "$APP_DIR/public/"
    remove_favicon_assets "$APP_DIR/public"

    # 6b. storage symlink for user-uploaded files (company logos, etc.)
    mkdir -p "$APP_DIR/storage/app/public"
    if [[ ! -L "$APP_DIR/public/storage" && ! -e "$APP_DIR/public/storage" ]]; then
        sudo -u "$WEB_USER" -E bash -c "cd '$APP_DIR' && php artisan storage:link" || \
            ln -sfn "$APP_DIR/storage/app/public" "$APP_DIR/public/storage"
    fi

    # 7. install web wizard
    WIZARD_DST="$APP_DIR/public/install"
    log "Installing web wizard at $WIZARD_DST ..."
    SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    if [[ -d "$SCRIPT_DIR/wizard" ]]; then
        mkdir -p "$WIZARD_DST"
        cp "$SCRIPT_DIR/wizard/index.php" "$WIZARD_DST/index.php"
        cp "$SCRIPT_DIR/wizard/.htaccess" "$WIZARD_DST/.htaccess" 2>/dev/null || true
    else
        warn "Wizard files not found next to script (expected $SCRIPT_DIR/wizard/). Embedding minimal placeholder."
        mkdir -p "$WIZARD_DST"
        cat > "$WIZARD_DST/index.php" <<'PHP'
<?php echo "Wizard payload missing — please re-download installer with the wizard/ folder."; ?>
PHP
    fi
    chown -R "$WEB_USER":"$WEB_USER" "$WIZARD_DST"

    # 8. nginx vhost
    VHOST="/etc/nginx/sites-available/${DOMAIN}.conf"
    log "Writing Nginx vhost $VHOST ..."
    cat > "$VHOST" <<NGINX
server {
    listen 80;
    listen [::]:80;
    server_name ${DOMAIN};

    root ${APP_DIR}/public;
    index index.php index.html;

    client_max_body_size 100M;

    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";

    # Service worker MUST not be HTTP-cached, or iOS PWAs miss updates.
    location = /service-worker.js {
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        expires 0;
        try_files \$uri =404;
    }
    location = /manifest.json {
        add_header Cache-Control "no-cache";
        try_files \$uri =404;
    }
    location = /manifest.webmanifest {
        add_header Cache-Control "no-cache";
        try_files \$uri =404;
    }

    # Wizard: serve PHP directly, no SPA rewrite.
    location = /install {
        return 301 /install/;
    }

    location = /install/ {
        rewrite ^ /install/index.php last;
    }

    location = /install/index.php {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/var/run/php/php${PHP_VERSION}-fpm.sock;
        fastcgi_read_timeout 300;
    }

    location ^~ /install/ {
        try_files \$uri =404;
    }

    # SPA + Laravel front controller.
    location / {
        try_files \$uri \$uri/ /index.php?\$query_string;
    }

    location ~ \.php\$ {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/var/run/php/php${PHP_VERSION}-fpm.sock;
        fastcgi_read_timeout 300;
    }

    location ~ /\.(?!well-known).* { deny all; }
}
NGINX
    ln -sf "$VHOST" "/etc/nginx/sites-enabled/${DOMAIN}.conf"
    [[ -L /etc/nginx/sites-enabled/default ]] && rm -f /etc/nginx/sites-enabled/default
    nginx -t
    systemctl enable --now nginx
    systemctl enable --now "php${PHP_VERSION}-fpm"
    systemctl restart "php${PHP_VERSION}-fpm"
    systemctl restart nginx

    cat <<EOM

\033[1;32m=========================================================
 PSM provisioning complete.
=========================================================\033[0m

  1. Open in your browser:
        http://${DOMAIN}/install/

     Complete the wizard (DB, app URL, first Super Admin).
     The wizard writes ${APP_DIR}/.env, runs migrations,
     creates your admin, then deletes itself.

  2. (Optional) HTTPS:
        sudo apt-get install -y certbot python3-certbot-nginx
        sudo certbot --nginx -d ${DOMAIN}

  3. Future updates:
        sudo $0 update --app-dir ${APP_DIR} --ui-dir ${UI_DIR}

EOM
}

# -------- dispatch -----------------------------------------------------------
case "$SUBCMD" in
    install)     do_install ;;
    update)      do_update ;;
    status)      do_status ;;
    self-update) do_self_update ;;
    help|-h|--help|"") usage ;;
    *) fail "Unknown subcommand: $SUBCMD" ;;
esac
