#!/usr/bin/env bash
# Build a self-contained installer tarball.
#
#   ./build-bundle.sh
#
# Produces:  /home/coops-installer.tar.gz
#
# To deploy on a target server:
#
#   wget https://YOUR-HOST/coops-installer.tar.gz
#   tar xzf coops-installer.tar.gz
#   cd coops-installer
#   sudo ./coops-install.sh install --domain coops.example.com \
#       --repo-app <git> --repo-ui <git>
set -euo pipefail
SRC="$(cd "$(dirname "$0")" && pwd)"
OUT="/home/coops-installer.tar.gz"
WORK="$(mktemp -d)"
trap "rm -rf '$WORK'" EXIT

mkdir -p "$WORK/coops-installer"
cp "$SRC/coops-install.sh" "$WORK/coops-installer/"
cp -r "$SRC/wizard"        "$WORK/coops-installer/"
cp    "$SRC/README.md"     "$WORK/coops-installer/"
chmod +x "$WORK/coops-installer/coops-install.sh"

tar -czf "$OUT" -C "$WORK" coops-installer
echo "Wrote $OUT ($(du -h "$OUT" | cut -f1))"
