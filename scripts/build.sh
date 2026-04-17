#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

APPS=("gmail" "drive" "docs" "sheets" "slides" "calendar")

echo "Building Google Workspace Desktop Apps..."
echo ""

for app in "${APPS[@]}"; do
  echo "Building $app..."
  cd "$ROOT_DIR/apps/$app"
  npm install --silent
  npm run build
  echo ""
done

echo "All apps built successfully."
echo "Run ./scripts/install.sh to install them."
