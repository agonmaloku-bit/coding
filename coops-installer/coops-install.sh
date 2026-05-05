#!/usr/bin/env bash
# =============================================================================
# CoOPS — server provisioning script
# -----------------------------------------------------------------------------
# Brings a fresh Ubuntu 22.04 / 24.04 / Debian 12 server from zero to a working
# CoOPS installation. After the script finishes, open /install/ in a browser
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
INSTALL_USER="coops"
REPO_APP=""
REPO_UI=""
NO_CLONE=0
SKIP_OS=0
PHP_VERSION="8.2"
NODE_MAJOR="18"
WEB_USER="www-data"
SELF_URL=""

SUBCMD="${1:-help}"
[[ $# -gt 0 ]] && shift || true

# -------- helpers ------------------------------------------------------------
log()  { printf '\033[1;34m[coops]\033[0m %s\n' "$*"; }
warn() { printf '\033[1;33m[warn]\033[0m  %s\n' "$*"; }
fail() { printf '\033[1;31m[fail]\033[0m  %s\n' "$*"; exit 1; }

usage() {
    cat <<EOF
CoOPS installer

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
  --repo-app <git-url>        Backend repo URL
  --repo-ui  <git-url>        UI repo URL
  --no-clone                  Skip git clone (sources already on disk)
  --skip-os                   Skip apt / OS package install
  --php <ver>                 PHP version  [default: $PHP_VERSION]
  --self-url <url>            Source URL for 'self-update' subcommand
EOF
}

# -------- args ---------------------------------------------------------------
while [[ $# -gt 0 ]]; do
    case "$1" in
        --domain)    DOMAIN="$2"; shift 2 ;;
        --app-dir)   APP_DIR="$2"; shift 2 ;;
        --ui-dir)    UI_DIR="$2"; shift 2 ;;
        --repo-app)  REPO_APP="$2"; shift 2 ;;
        --repo-ui)   REPO_UI="$2"; shift 2 ;;
        --no-clone)  NO_CLONE=1; shift ;;
        --skip-os)   SKIP_OS=1; shift ;;
        --php)       PHP_VERSION="$2"; shift 2 ;;
        --self-url)  SELF_URL="$2"; shift 2 ;;
        -h|--help)   usage; exit 0 ;;
        *) fail "Unknown option: $1" ;;
    esac
done

require_root() { [[ $EUID -eq 0 ]] || fail "must run as root (use sudo)"; }

# -------- subcommand: status -------------------------------------------------
do_status() {
    log "PHP:        $(php -v 2>/dev/null | head -1 || echo 'not installed')"
    log "Composer:   $(composer --version 2>/dev/null || echo 'not installed')"
    log "Node:       $(node -v 2>/dev/null || echo 'not installed')"
    log "Nginx:      $(nginx -v 2>&1 || echo 'not installed')"
    log "MariaDB:    $(mariadb --version 2>/dev/null || mysql --version 2>/dev/null || echo 'not installed')"
    log "Ghostscript:$(gs --version 2>/dev/null || echo 'not installed')"
    for s in nginx php${PHP_VERSION}-fpm mariadb; do
        printf '\033[1;34m[coops]\033[0m %-20s %s\n' "$s" \
            "$(systemctl is-active "$s" 2>/dev/null || echo 'inactive')"
    done
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

# -------- subcommand: update -------------------------------------------------
do_update() {
    require_root
    [[ -d "$APP_DIR/.git" ]] || fail "$APP_DIR is not a git checkout"
    [[ -d "$UI_DIR/.git"  ]] || fail "$UI_DIR is not a git checkout"

    log "Pulling backend..."
    sudo -u "$INSTALL_USER" git -C "$APP_DIR" pull --ff-only
    sudo -u "$INSTALL_USER" -E bash -c "cd '$APP_DIR' && composer install --no-interaction --no-dev --prefer-dist --optimize-autoloader"
    sudo -u "$WEB_USER" -E bash -c "cd '$APP_DIR' && php artisan migrate --force"

    log "Rebuilding UI..."
    sudo -u "$INSTALL_USER" git -C "$UI_DIR" pull --ff-only
    sudo -u "$INSTALL_USER" -E bash -c "cd '$UI_DIR' && npm ci --legacy-peer-deps && NODE_OPTIONS=--openssl-legacy-provider npm run build"
    cp -r "$UI_DIR"/dist/* "$APP_DIR/public/"
    chown -R "$WEB_USER":"$WEB_USER" "$APP_DIR/public"

    log "Reloading php-fpm..."
    systemctl reload "php${PHP_VERSION}-fpm" || systemctl restart "php${PHP_VERSION}-fpm"

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
        apt-get install -y --no-install-recommends \
            ca-certificates curl wget gnupg lsb-release software-properties-common \
            git unzip zip rsync sudo \
            nginx mariadb-server \
            ghostscript imagemagick ufw

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

        # Retry up to 3 times — launchpad/sury can be flaky.
        attempts=0
        while : ; do
            ensure_php_repo || true
            if apt-cache policy "php${PHP_VERSION}-fpm" 2>/dev/null | grep -q "Candidate: [^(]"; then
                break
            fi
            attempts=$((attempts+1))
            if [[ $attempts -ge 3 ]]; then
                fail "php${PHP_VERSION}-fpm is still not available after 3 attempts. The PHP repository (ppa:ondrej/php on Ubuntu, packages.sury.org on Debian) is not reachable from this server. Check outbound HTTPS to ppa.launchpadcontent.net / packages.sury.org and re-run."
            fi
            warn "PHP repo not reachable yet (attempt $attempts/3) — retrying in 10s..."
            sleep 10
        done

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
        usermod -aG "$WEB_USER" "$INSTALL_USER" || true
    fi

    # 3. fetch source
    if [[ $NO_CLONE -eq 0 ]]; then
        [[ -z "$REPO_APP" || -z "$REPO_UI" ]] && fail "--repo-app and --repo-ui are required (or pass --no-clone)"
        mkdir -p "$(dirname "$APP_DIR")" "$(dirname "$UI_DIR")"
        chown -R "$INSTALL_USER":"$INSTALL_USER" "$(dirname "$APP_DIR")" "$(dirname "$UI_DIR")"

        if [[ ! -d "$APP_DIR/.git" ]]; then
            log "Cloning backend into $APP_DIR ..."
            sudo -u "$INSTALL_USER" git clone "$REPO_APP" "$APP_DIR"
        else
            warn "$APP_DIR exists, pulling"
            sudo -u "$INSTALL_USER" git -C "$APP_DIR" pull --ff-only
        fi
        if [[ ! -d "$UI_DIR/.git" ]]; then
            log "Cloning UI into $UI_DIR ..."
            sudo -u "$INSTALL_USER" git clone "$REPO_UI" "$UI_DIR"
        else
            warn "$UI_DIR exists, pulling"
            sudo -u "$INSTALL_USER" git -C "$UI_DIR" pull --ff-only
        fi
    fi
    [[ -d "$APP_DIR" ]] || fail "Backend directory missing: $APP_DIR"
    [[ -d "$UI_DIR"  ]] || fail "UI directory missing: $UI_DIR"

    # 4. backend deps
    log "Installing backend composer dependencies..."
    sudo -u "$INSTALL_USER" -E bash -c "cd '$APP_DIR' && composer install --no-interaction --prefer-dist --optimize-autoloader"

    log "Preparing storage / bootstrap cache..."
    mkdir -p "$APP_DIR/storage/framework/"{cache,sessions,views} "$APP_DIR/storage/logs" "$APP_DIR/bootstrap/cache"
    chown -R "$WEB_USER":"$WEB_USER" "$APP_DIR/storage" "$APP_DIR/bootstrap/cache"
    chmod -R 775 "$APP_DIR/storage" "$APP_DIR/bootstrap/cache"

    if [[ ! -f "$APP_DIR/.env" ]]; then
        log "Creating empty .env (wizard will populate it)..."
        cp "$APP_DIR/.env.example" "$APP_DIR/.env" 2>/dev/null || touch "$APP_DIR/.env"
    fi
    chown "$WEB_USER":"$WEB_USER" "$APP_DIR/.env"
    chmod 664 "$APP_DIR/.env"

    # 5. UI build
    log "Building UI..."
    sudo -u "$INSTALL_USER" -E bash -c "cd '$UI_DIR' && (test -f package-lock.json && npm ci --legacy-peer-deps || npm install --legacy-peer-deps) && NODE_OPTIONS=--openssl-legacy-provider npm run build"
    mkdir -p "$APP_DIR/public"
    cp -r "$UI_DIR"/dist/* "$APP_DIR/public/"

    # 6. install web wizard
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

    # 7. nginx vhost
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

    # Wizard: serve PHP directly, no SPA rewrite.
    location ^~ /install/ {
        try_files \$uri \$uri/ /install/index.php?\$query_string;
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
    systemctl reload nginx
    systemctl enable --now nginx
    systemctl enable --now "php${PHP_VERSION}-fpm"
    systemctl enable --now mariadb

    cat <<EOM

\033[1;32m=========================================================
 CoOPS provisioning complete.
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
