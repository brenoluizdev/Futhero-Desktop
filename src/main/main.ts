import { app, BrowserWindow, BrowserView, ipcMain } from 'electron';
import { autoUpdater } from 'electron-updater';
import * as path from 'path';

let mainWindow: BrowserWindow | null = null;
let gameView: BrowserView | null = null;
let currentGame: 'bonk' | 'haxball' | null = null;

const GAME_URLS = {
  bonk: 'https://bonk.io',
  haxball: 'https://www.haxball.com'
};

// Configuração do Auto-Updater
autoUpdater.autoDownload = true;
autoUpdater.autoInstallOnAppQuit = true;

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    minWidth: 800,
    minHeight: 600,
    frame: true,
    backgroundColor: '#1a1a1a',
    webPreferences: {
      preload: path.join(__dirname, '../preload/preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });

  // Load da UI principal
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:8081');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  // Auto-updater events
  autoUpdater.on('update-available', () => {
    mainWindow?.webContents.send('update-available');
  });

  autoUpdater.on('update-downloaded', () => {
    mainWindow?.webContents.send('update-downloaded');
  });

  autoUpdater.on('error', (err) => {
    console.error('Update error:', err);
  });

  // Check for updates (apenas em produção)
  if (process.env.NODE_ENV !== 'development') {
    autoUpdater.checkForUpdatesAndNotify();
  }
}

function createGameView(game: 'bonk' | 'haxball'): void {
  if (!mainWindow) return;

  currentGame = game;
  
  // Remove view anterior se existir
  if (gameView) {
    mainWindow.removeBrowserView(gameView);
    gameView.webContents.close();
  }

  gameView = new BrowserView({
    webPreferences: {
      preload: path.join(__dirname, '../preload/injector.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });

  mainWindow.addBrowserView(gameView);
  
  // Ajustar bounds do BrowserView
  const bounds = mainWindow.getContentBounds();
  gameView.setBounds({
    x: 0,
    y: 0,
    width: bounds.width,
    height: bounds.height
  });

  gameView.setAutoResize({
    width: true,
    height: true
  });

  // Carregar o jogo
  gameView.webContents.loadURL(GAME_URLS[game]);

  // Ocultar a UI principal
  mainWindow.webContents.send('game-loaded', game);
}

function closeGameView(): void {
  if (!mainWindow || !gameView) return;

  mainWindow.removeBrowserView(gameView);
  gameView.webContents.close();
  gameView = null;
  currentGame = null;

  mainWindow.webContents.send('game-closed');
}

// IPC Handlers
ipcMain.handle('launch-game', async (_, game: 'bonk' | 'haxball') => {
  createGameView(game);
  return { success: true };
});

ipcMain.handle('close-game', async () => {
  closeGameView();
  return { success: true };
});

ipcMain.handle('switch-game', async (_, game: 'bonk' | 'haxball') => {
  createGameView(game);
  return { success: true };
});

ipcMain.handle('get-current-game', async () => {
  return currentGame;
});

ipcMain.handle('get-app-version', async () => {
  return app.getVersion();
});

ipcMain.handle('quit-and-install', async () => {
  autoUpdater.quitAndInstall();
});

// App lifecycle
app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});