const { app, BrowserWindow, shell, Menu } = require('electron')
const path = require('path')
const fs = require('fs')

app.setAsDefaultProtocolClient('gdocs')

let windows = []
let urlToOpen = null

function createWindow(url) {
  const { nativeTheme } = require('electron')
  nativeTheme.themeSource = 'dark'

  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    title: 'Google Docs',
    autoHideMenuBar: true,
    titleBarStyle: 'default',
    backgroundColor: '#1a1a1a',
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      spellcheck: true,
      partition: 'persist:docs'
    }
  })

  win.webContents.session.setPermissionRequestHandler((wc, p, cb) => cb(true))
  win.loadURL(url || 'https://docs.google.com/document/u/0/')

  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.includes('google.com')) {
      win.loadURL(url)
      return { action: 'deny' }
    }
    shell.openExternal(url)
    return { action: 'deny' }
  })

  win.webContents.on('page-title-updated', (event, title) => {
    event.preventDefault()
    win.setTitle(title)
  })

  win.on('closed', () => {
    windows = windows.filter(w => w !== win)
  })

  windows.push(win)
  return win
}

// Handle file open — reads .gdoc JSON to get doc_id, opens new window
app.on('open-file', (event, filePath) => {
  event.preventDefault()
  try {
    const content = fs.readFileSync(filePath, 'utf8')
    const data = JSON.parse(content)
    if (data.doc_id) {
      const url = `https://docs.google.com/document/d/${data.doc_id}/edit`
      if (app.isReady()) {
        createWindow(url)
      } else {
        urlToOpen = url
      }
    }
  } catch (e) {
    if (app.isReady()) createWindow()
  }
})

app.on('open-url', (event, url) => {
  event.preventDefault()
  const realUrl = url.replace('gdocs://', '')
  if (app.isReady()) {
    createWindow(realUrl)
  } else {
    urlToOpen = realUrl
  }
})

function createMenu() {
  const template = [
    {
      label: 'Google Docs',
      submenu: [
        { label: 'About Google Docs', role: 'about' },
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
        { label: 'Reload', accelerator: 'Command+R', click: () => BrowserWindow.getFocusedWindow()?.webContents.reload() },
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
        { label: 'New Document', accelerator: 'Command+N', click: () => createWindow('https://docs.google.com/document/create') },
        { label: 'All Docs', accelerator: 'Command+1', click: () => { const w = BrowserWindow.getFocusedWindow(); if (w) w.loadURL('https://docs.google.com/document/u/0/') } }
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
  createWindow(urlToOpen)
  urlToOpen = null
  app.on('activate', () => { if (windows.length === 0) createWindow() })
})

app.on('before-quit', () => { app.quitting = true })
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit() })
