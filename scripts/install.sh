#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
INSTALL_DIR="$HOME/Applications"

mkdir -p "$INSTALL_DIR"

# App name mappings (directory -> build output name)
declare -A APP_NAMES=(
  ["gmail"]="Gmail"
  ["drive"]="Google Drive"
  ["docs"]="Google Docs"
  ["sheets"]="Google Sheets"
  ["slides"]="Google Slides"
  ["calendar"]="Google Calendar"
)

echo "Installing Google Workspace Desktop Apps to $INSTALL_DIR..."
echo ""

for app in gmail drive docs sheets slides calendar; do
  name="${APP_NAMES[$app]}"
  build_dir="$ROOT_DIR/apps/$app/${name}-darwin-arm64"

  if [ ! -d "$build_dir" ]; then
    echo "Skipping $name (not built yet - run ./scripts/build.sh first)"
    continue
  fi

  echo "Installing $name..."

  # Kill running instance
  pkill -f "$name.app" 2>/dev/null || true

  # Remove old version
  rm -rf "$INSTALL_DIR/${name}.app"

  # Copy new version
  cp -R "$build_dir/${name}.app" "$INSTALL_DIR/${name}.app"

  # Copy icon if it exists
  if [ -f "$ROOT_DIR/apps/$app/icon.icns" ]; then
    cp "$ROOT_DIR/apps/$app/icon.icns" "$INSTALL_DIR/${name}.app/Contents/Resources/electron.icns"
  fi

  # Remove quarantine flag
  xattr -cr "$INSTALL_DIR/${name}.app" 2>/dev/null || true

  # Register with Launch Services
  /System/Library/Frameworks/CoreServices.framework/Frameworks/LaunchServices.framework/Support/lsregister -f "$INSTALL_DIR/${name}.app"

  echo "  Installed to $INSTALL_DIR/${name}.app"
done

echo ""

# Set file associations if duti is available
if command -v duti &>/dev/null; then
  echo "Setting file associations..."
  duti -s com.googledocs.desktop .gdoc all 2>/dev/null || true
  duti -s com.googlesheets.desktop .gsheet all 2>/dev/null || true
  duti -s com.googleslides.desktop .gslides all 2>/dev/null || true
  echo "  .gdoc  -> Google Docs"
  echo "  .gsheet -> Google Sheets"
  echo "  .gslides -> Google Slides"
else
  echo "Optional: Install duti for automatic file associations:"
  echo "  brew install duti"
  echo "  duti -s com.googledocs.desktop .gdoc all"
  echo "  duti -s com.googlesheets.desktop .gsheet all"
  echo "  duti -s com.googleslides.desktop .gslides all"
fi

echo ""
echo "Done! Apps are installed in $INSTALL_DIR"
echo ""
echo "Next steps:"
echo "  1. Drag apps to your Dock"
echo "  2. Sign into your Google account in each app"
echo "  3. Install Google Drive for Desktop for file sync: https://www.google.com/drive/download/"
