const { app, BrowserWindow, shell, Menu, nativeImage, Tray } = require('electron')
const path = require('path')

// Force dark mode for the app
app.commandLine.appendSwitch('force-dark-mode')
app.commandLine.appendSwitch('enable-features', 'WebContentsForceDark')

let mainWindow
let tray

function createWindow() {
  const { nativeTheme } = require('electron')
  nativeTheme.themeSource = 'dark'

  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    title: 'Gmail',
    autoHideMenuBar: true,
    titleBarStyle: 'default',
    backgroundColor: '#1a1a1a',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      spellcheck: true,
      partition: 'persist:gmail'
    }
  })

  // Auto-grant notification permissions
  mainWindow.webContents.session.setPermissionRequestHandler((webContents, permission, callback) => {
    if (permission === 'notifications') {
      callback(true)
      return
    }
    callback(true)
  })

  mainWindow.loadURL('https://mail.google.com')

  // Open external links in default browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https://mail.google.com') ||
        url.startsWith('https://accounts.google.com') ||
        url.startsWith('https://contacts.google.com') ||
        url.startsWith('https://calendar.google.com')) {
      mainWindow.loadURL(url)
      return { action: 'deny' }
    }
    shell.openExternal(url)
    return { action: 'deny' }
  })

  // Update title with unread count
  mainWindow.webContents.on('page-title-updated', (event, title) => {
    event.preventDefault()
    mainWindow.setTitle(title.includes('Inbox') ? title : `Gmail - ${title}`)
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
      label: 'Gmail',
      submenu: [
        { label: 'About Gmail', role: 'about' },
        { type: 'separator' },
        { label: 'Hide Gmail', accelerator: 'Command+H', role: 'hide' },
        { label: 'Hide Others', accelerator: 'Command+Shift+H', role: 'hideOthers' },
        { type: 'separator' },
        {
          label: 'Quit Gmail',
          accelerator: 'Command+Q',
          click: () => {
            app.quitting = true
            app.quit()
          }
        }
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
        {
          label: 'Reload',
          accelerator: 'Command+R',
          click: () => mainWindow?.webContents.reload()
        },
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
        {
          label: 'Inbox',
          accelerator: 'Command+1',
          click: () => mainWindow?.loadURL('https://mail.google.com/mail/u/0/#inbox')
        },
        {
          label: 'Starred',
          accelerator: 'Command+2',
          click: () => mainWindow?.loadURL('https://mail.google.com/mail/u/0/#starred')
        },
        {
          label: 'Sent',
          accelerator: 'Command+3',
          click: () => mainWindow?.loadURL('https://mail.google.com/mail/u/0/#sent')
        },
        {
          label: 'Drafts',
          accelerator: 'Command+4',
          click: () => mainWindow?.loadURL('https://mail.google.com/mail/u/0/#drafts')
        },
        { type: 'separator' },
        {
          label: 'Compose',
          accelerator: 'Command+N',
          click: () => mainWindow?.loadURL('https://mail.google.com/mail/u/0/#inbox?compose=new')
        }
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

  app.on('activate', () => {
    if (mainWindow) {
      mainWindow.show()
    } else {
      createWindow()
    }
  })
})

app.on('before-quit', () => {
  app.quitting = true
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
