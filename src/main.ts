import * as electron from 'electron';
const { app, BrowserWindow, protocol } = electron;
import * as path from 'path';
require('dotenv').config();

const BONK_IO_URL = 'https://bonk.io/';

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      contextIsolation: true,
      sandbox: true,
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      webSecurity: true,
    },
  });

  mainWindow.loadURL(BONK_IO_URL);

  if (process.env.NODE_ENV === 'development') mainWindow.webContents.openDevTools();
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});