const { app, BrowserWindow, shell, Menu } = require('electron')
const path = require('path')

let mainWindow

function createWindow() {
  const { nativeTheme } = require('electron')
  nativeTheme.themeSource = 'dark'

  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    title: 'Google Calendar',
    autoHideMenuBar: true,
    titleBarStyle: 'default',
    backgroundColor: '#1a1a1a',
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      spellcheck: true,
      partition: 'persist:calendar'
    }
  })

  // Auto-grant notification permissions
  mainWindow.webContents.session.setPermissionRequestHandler((webContents, permission, callback) => {
    callback(true)
  })

  mainWindow.loadURL('https://calendar.google.com/calendar/u/0/r')

  // Keep all Google URLs in the same window
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.includes('google.com')) {
      mainWindow.loadURL(url)
      return { action: 'deny' }
    }
    shell.openExternal(url)
    return { action: 'deny' }
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
      label: 'Google Calendar',
      submenu: [
        { label: 'About Google Calendar', role: 'about' },
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
        { label: 'Day', accelerator: 'Command+1', click: () => mainWindow?.loadURL('https://calendar.google.com/calendar/u/0/r/day') },
        { label: 'Week', accelerator: 'Command+2', click: () => mainWindow?.loadURL('https://calendar.google.com/calendar/u/0/r/week') },
        { label: 'Month', accelerator: 'Command+3', click: () => mainWindow?.loadURL('https://calendar.google.com/calendar/u/0/r/month') },
        { label: 'Year', accelerator: 'Command+4', click: () => mainWindow?.loadURL('https://calendar.google.com/calendar/u/0/r/year') },
        { type: 'separator' },
        { label: 'Today', accelerator: 'Command+T', click: () => mainWindow?.loadURL('https://calendar.google.com/calendar/u/0/r') }
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
