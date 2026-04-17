# Google Workspace Desktop

[![GitHub stars](https://img.shields.io/github/stars/regann19/google-workspace-desktop?style=social)](https://github.com/regann19/google-workspace-desktop/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/regann19/google-workspace-desktop?style=social)](https://github.com/regann19/google-workspace-desktop/network/members)
[![GitHub issues](https://img.shields.io/github/issues/regann19/google-workspace-desktop)](https://github.com/regann19/google-workspace-desktop/issues)
[![GitHub license](https://img.shields.io/github/license/regann19/google-workspace-desktop)](https://github.com/regann19/google-workspace-desktop/blob/master/LICENSE)
[![Platform](https://img.shields.io/badge/platform-macOS-blue)](https://github.com/regann19/google-workspace-desktop)
[![Built with Electron](https://img.shields.io/badge/built%20with-Electron-47848f?logo=electron&logoColor=white)](https://www.electronjs.org/)

Native macOS desktop apps for Google Workspace — Gmail, Drive, Docs, Sheets, Slides, and Calendar. Built with Electron.

No Chrome dependency. External links open in your default browser. Each app runs as a standalone window with its own dock icon.

## Features

- **Standalone apps** — Gmail, Drive, Docs, Sheets, Slides, Calendar as individual macOS apps
- **Multi-window support** — Docs, Sheets, and Slides open each document in its own window
- **File associations** — Double-click `.gdoc`, `.gsheet`, `.gslides` files to open them directly
- **Persistent sessions** — Sign in once, stay signed in
- **Notifications** — Desktop notifications for new emails and calendar events
- **Dock integration** — Pin to dock, multiple windows grouped under one icon
- **Default browser** — External links open in your default browser (not Chrome)
- **Keyboard shortcuts** — Navigate between views with `Cmd+1-5`

## Prerequisites

- **macOS** (Apple Silicon)
- **Node.js** 18+ and npm
- **Google Drive for Desktop** (optional, for file sync and `.gdoc` file support) — [Download](https://www.google.com/drive/download/)

## Installation

```bash
# Clone the repo
git clone https://github.com/regann19/google-workspace-desktop.git
cd google-workspace-desktop

# Build all apps
./scripts/build.sh

# Install to ~/Applications
./scripts/install.sh
```

That's it. The install script:
- Copies all apps to `~/Applications`
- Removes macOS quarantine warnings
- Registers apps with Launch Services
- Sets up file associations (if `duti` is installed)

## File Associations

To open `.gdoc`, `.gsheet`, and `.gslides` files directly in these apps:

```bash
brew install duti

duti -s com.googledocs.desktop .gdoc all
duti -s com.googlesheets.desktop .gsheet all
duti -s com.googleslides.desktop .gslides all
```

This requires [Google Drive for Desktop](https://www.google.com/drive/download/) to be installed, which syncs your Drive files locally as `.gdoc`/`.gsheet`/`.gslides` files.

## Google Drive for Desktop

For the best experience, install [Google Drive for Desktop](https://www.google.com/drive/download/). This:

- Syncs your Google Drive files to your Mac
- Creates `.gdoc`, `.gsheet`, `.gslides` files that can be opened with these apps
- Enables double-click to open any Drive document in the correct Electron app

After installing, your files appear in `~/Library/CloudStorage/GoogleDrive-{email}/`.

## Notifications

To enable desktop notifications:

**Gmail:**
1. Open the Gmail app
2. Settings (gear icon) > See all settings > General
3. Scroll to "Desktop notifications" > Enable

**Calendar:**
1. Open the Calendar app
2. Settings (gear icon) > Notification settings
3. Enable notifications

**macOS:**
1. System Settings > Notifications
2. Find Gmail / Google Calendar
3. Toggle "Allow Notifications" on

Apps must be running to receive notifications.

## Keyboard Shortcuts

### Gmail
| Shortcut | Action |
|----------|--------|
| `Cmd+1` | Inbox |
| `Cmd+2` | Starred |
| `Cmd+3` | Sent |
| `Cmd+4` | Drafts |
| `Cmd+N` | Compose |

### Drive
| Shortcut | Action |
|----------|--------|
| `Cmd+1` | My Drive |
| `Cmd+2` | Shared with Me |
| `Cmd+3` | Recent |
| `Cmd+4` | Starred |
| `Cmd+5` | Trash |

### Calendar
| Shortcut | Action |
|----------|--------|
| `Cmd+1` | Day view |
| `Cmd+2` | Week view |
| `Cmd+3` | Month view |
| `Cmd+4` | Year view |
| `Cmd+T` | Today |

### Docs / Sheets / Slides
| Shortcut | Action |
|----------|--------|
| `Cmd+N` | New document |
| `Cmd+1` | All documents |

### All Apps
| Shortcut | Action |
|----------|--------|
| `Cmd+R` | Reload |
| `Cmd++` | Zoom in |
| `Cmd+-` | Zoom out |
| `Cmd+0` | Reset zoom |
| `Ctrl+Cmd+F` | Full screen |
| `Cmd+Q` | Quit |

## How It Works

Each app is a lightweight Electron wrapper around the corresponding Google Workspace web app. There is no custom backend or API integration — it loads the real Google web interface in a native window.

- **Session persistence** — Each app stores its login session in an isolated Electron partition (`persist:gmail`, `persist:docs`, etc.)
- **File opening** — `.gdoc`/`.gsheet`/`.gslides` files are small JSON files containing a `doc_id`. The app reads this ID and navigates to `https://docs.google.com/document/d/{doc_id}/edit`
- **Link handling** — Google URLs stay in the app window. Everything else opens in your default browser via `shell.openExternal()`

## Development

Run any individual app in dev mode:

```bash
cd apps/gmail
npm install
npm start
```

Rebuild a single app:

```bash
cd apps/gmail
npm run build
```

## Contributing

Contributions are welcome! Feel free to open an issue or submit a pull request.

1. Fork the repo
2. Create your feature branch (`git checkout -b feature/my-feature`)
3. Commit your changes (`git commit -am 'Add my feature'`)
4. Push to the branch (`git push origin feature/my-feature`)
5. Open a Pull Request

## License

MIT

---

If you find this useful, give it a star! It helps others discover the project.
