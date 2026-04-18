const { app, BrowserWindow, shell, Menu } = require('electron')
const { exec } = require('child_process')
const path = require('path')

// Route document URLs to the correct Electron app
function openInApp(url) {
  if (url.match(/docs\.google\.com\/document/)) {
    exec(`open -a "${process.env.HOME}/Applications/Google Docs.app" "${url}"`)
    return true
  }
  if (url.match(/docs\.google\.com\/spreadsheets/)) {
    exec(`open -a "${process.env.HOME}/Applications/Google Sheets.app" "${url}"`)
    return true
  }
  if (url.match(/docs\.google\.com\/presentation/)) {
    exec(`open -a "${process.env.HOME}/Applications/Google Slides.app" "${url}"`)
    return true
  }
  return false
}

let mainWindow

function createWindow() {
  const { nativeTheme } = require('electron')
  nativeTheme.themeSource = 'dark'

  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    title: 'Google Drive',
    autoHideMenuBar: true,
    titleBarStyle: 'default',
    backgroundColor: '#1a1a1a',
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      spellcheck: true,
      partition: 'persist:drive'
    }
  })

  // Auto-grant notification permissions
  mainWindow.webContents.session.setPermissionRequestHandler((webContents, permission, callback) => {
    callback(true)
  })

  mainWindow.loadURL('https://drive.google.com/drive/home')

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    // Route docs/sheets/slides to their own apps
    if (openInApp(url)) return { action: 'deny' }

    // Keep Drive and auth URLs in this window
    if (url.includes('drive.google.com') || url.includes('accounts.google.com')) {
      mainWindow.loadURL(url)
      return { action: 'deny' }
    }
    shell.openExternal(url)
    return { action: 'deny' }
  })

  // Catch in-page navigation to docs/sheets/slides
  mainWindow.webContents.on('will-navigate', (event, url) => {
    if (openInApp(url)) {
      event.preventDefault()
    }
  })

  mainWindow.webContents.on('page-title-updated', (event, title) => {
    event.preventDefault()
    mainWindow.setTitle(title)
  })

  mainWindow.on('close', (event) => {
    if (app.quitting) {
      mainWindow = null
    } else {
      event.preventDefault()
      mainWindow.hide()
    }
  })
}

function createMenu() {
  const template = [
    {
      label: 'Google Drive',
      submenu: [
        { label: 'About Google Drive', role: 'about' },
        { type: 'separator' },
        { label: 'Hide', accelerator: 'Command+H', role: 'hide' },
        { label: 'Hide Others', accelerator: 'Command+Shift+H', role: 'hideOthers' },
        { type: 'separator' },
        { label: 'Quit', accelerator: 'Command+Q', click: () => { app.quitting = true; app.quit() } }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { label: 'Undo', accelerator: 'Command+Z', role: 'undo' },
        { label: 'Redo', accelerator: 'Command+Shift+Z', role: 'redo' },
        { type: 'separator' },
        { label: 'Cut', accelerator: 'Command+X', role: 'cut' },
        { label: 'Copy', accelerator: 'Command+C', role: 'copy' },
        { label: 'Paste', accelerator: 'Command+V', role: 'paste' },
        { label: 'Select All', accelerator: 'Command+A', role: 'selectAll' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { label: 'Reload', accelerator: 'Command+R', click: () => mainWindow?.webContents.reload() },
        { type: 'separator' },
        { label: 'Zoom In', accelerator: 'Command+Plus', role: 'zoomIn' },
        { label: 'Zoom Out', accelerator: 'Command+-', role: 'zoomOut' },
        { label: 'Reset Zoom', accelerator: 'Command+0', role: 'resetZoom' },
        { type: 'separator' },
        { label: 'Full Screen', accelerator: 'Ctrl+Command+F', role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Go',
      submenu: [
        { label: 'My Drive', accelerator: 'Command+1', click: () => mainWindow?.loadURL('https://drive.google.com/drive/my-drive') },
        { label: 'Shared with Me', accelerator: 'Command+2', click: () => mainWindow?.loadURL('https://drive.google.com/drive/shared-with-me') },
        { label: 'Recent', accelerator: 'Command+3', click: () => mainWindow?.loadURL('https://drive.google.com/drive/recent') },
        { label: 'Starred', accelerator: 'Command+4', click: () => mainWindow?.loadURL('https://drive.google.com/drive/starred') },
        { label: 'Trash', accelerator: 'Command+5', click: () => mainWindow?.loadURL('https://drive.google.com/drive/trash') }
      ]
    },
    {
      label: 'Window',
      submenu: [
        { label: 'Minimize', accelerator: 'Command+M', role: 'minimize' },
        { label: 'Close', accelerator: 'Command+W', role: 'close' }
      ]
    }
  ]
  Menu.setApplicationMenu(Menu.buildFromTemplate(template))
}

app.whenReady().then(() => {
  createMenu()
  createWindow()
  app.on('activate', () => { if (mainWindow) mainWindow.show(); else createWindow() })
})

app.on('before-quit', () => { app.quitting = true })
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit() })
