const { app, BrowserWindow, shell, Menu } = require('electron')
const path = require('path')
const fs = require('fs')

app.setAsDefaultProtocolClient('gsheets')

let windows = []
let urlToOpen = null

function createWindow(url) {
  const { nativeTheme } = require('electron')
  nativeTheme.themeSource = 'dark'

  const win = new BrowserWindow({
    width: 1400, height: 900, minWidth: 800, minHeight: 600,
    title: 'Google Sheets', autoHideMenuBar: true, titleBarStyle: 'default',
    backgroundColor: '#1a1a1a',
    webPreferences: { contextIsolation: true, nodeIntegration: false, spellcheck: true, partition: 'persist:sheets' }
  })

  win.webContents.session.setPermissionRequestHandler((wc, p, cb) => cb(true))
  win.loadURL(url || 'https://docs.google.com/spreadsheets/u/0/')

  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.includes('google.com')) { win.loadURL(url); return { action: 'deny' } }
    shell.openExternal(url); return { action: 'deny' }
  })

  win.webContents.on('page-title-updated', (event, title) => { event.preventDefault(); win.setTitle(title) })
  win.on('closed', () => { windows = windows.filter(w => w !== win) })
  windows.push(win)
  return win
}

app.on('open-file', (event, filePath) => {
  event.preventDefault()
  try {
    const content = fs.readFileSync(filePath, 'utf8')
    const data = JSON.parse(content)
    if (data.doc_id) {
      const url = `https://docs.google.com/spreadsheets/d/${data.doc_id}/edit`
      if (app.isReady()) createWindow(url)
      else urlToOpen = url
    }
  } catch (e) {
    if (app.isReady()) createWindow()
  }
})

app.on('open-url', (event, url) => {
  event.preventDefault()
  const realUrl = url.replace('gsheets://', '')
  if (app.isReady()) createWindow(realUrl)
  else urlToOpen = realUrl
})

function createMenu() {
  const template = [
    { label: 'Google Sheets', submenu: [
      { label: 'About Google Sheets', role: 'about' }, { type: 'separator' },
      { label: 'Hide', accelerator: 'Command+H', role: 'hide' },
      { label: 'Hide Others', accelerator: 'Command+Shift+H', role: 'hideOthers' }, { type: 'separator' },
      { label: 'Quit', accelerator: 'Command+Q', click: () => { app.quitting = true; app.quit() } }
    ]},
    { label: 'Edit', submenu: [
      { label: 'Undo', accelerator: 'Command+Z', role: 'undo' },
      { label: 'Redo', accelerator: 'Command+Shift+Z', role: 'redo' }, { type: 'separator' },
      { label: 'Cut', accelerator: 'Command+X', role: 'cut' },
      { label: 'Copy', accelerator: 'Command+C', role: 'copy' },
      { label: 'Paste', accelerator: 'Command+V', role: 'paste' },
      { label: 'Select All', accelerator: 'Command+A', role: 'selectAll' }
    ]},
    { label: 'View', submenu: [
      { label: 'Reload', accelerator: 'Command+R', click: () => BrowserWindow.getFocusedWindow()?.webContents.reload() }, { type: 'separator' },
      { label: 'Zoom In', accelerator: 'Command+Plus', role: 'zoomIn' },
      { label: 'Zoom Out', accelerator: 'Command+-', role: 'zoomOut' },
      { label: 'Reset Zoom', accelerator: 'Command+0', role: 'resetZoom' }, { type: 'separator' },
      { label: 'Full Screen', accelerator: 'Ctrl+Command+F', role: 'togglefullscreen' }
    ]},
    { label: 'Go', submenu: [
      { label: 'New Spreadsheet', accelerator: 'Command+N', click: () => createWindow('https://docs.google.com/spreadsheets/create') },
      { label: 'All Sheets', accelerator: 'Command+1', click: () => { const w = BrowserWindow.getFocusedWindow(); if (w) w.loadURL('https://docs.google.com/spreadsheets/u/0/') } }
    ]},
    { label: 'Window', submenu: [
      { label: 'Minimize', accelerator: 'Command+M', role: 'minimize' },
      { label: 'Close', accelerator: 'Command+W', role: 'close' }
    ]}
  ]
  Menu.setApplicationMenu(Menu.buildFromTemplate(template))
}

app.whenReady().then(() => { createMenu(); createWindow(urlToOpen); urlToOpen = null; app.on('activate', () => { if (windows.length === 0) createWindow() }) })
app.on('before-quit', () => { app.quitting = true })
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit() })
