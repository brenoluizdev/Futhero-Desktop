import { app, BrowserWindow, ipcMain } from "electron";
import { autoUpdater } from "electron-updater";
import * as path from "path";

let mainWindow: BrowserWindow | null = null;
let currentGame: "bonk" | "haxball" | null = null;

const GAME_URLS = {
  bonk: "https://bonk.io",
  haxball: "https://www.haxball.com",
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
    backgroundColor: "#1a1a1a",
    webPreferences: {
      preload: path.join(__dirname, "../preload/preload.js"),
      contextIsolation: true,
      sandbox: false,
      nodeIntegration: false,
      webSecurity: false,
      devTools: true,
    },
  });

  if (process.env.NODE_ENV === "development") {
    mainWindow.loadURL("http://localhost:8081");
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, "../renderer/index.html"));
  }

  // Auto-updater events
  autoUpdater.on("update-available", () => {
    mainWindow?.webContents.send("update-available");
  });

  autoUpdater.on("update-downloaded", () => {
    mainWindow?.webContents.send("update-downloaded");
  });

  autoUpdater.on("error", (err) => {
    console.error("Update error:", err);
  });

  if (process.env.NODE_ENV !== "development") {
    autoUpdater.checkForUpdatesAndNotify();
  }
}

function launchGameWindow(game: "bonk" | "haxball") {
  if (!mainWindow) return;

  currentGame = game;

  const gameWindow = new BrowserWindow({
    parent: mainWindow,
    modal: false,
    width: 1280,
    height: 720,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, "../preload/injector.js"),
      contextIsolation: true,
      sandbox: false,
      nodeIntegration: false,
      webSecurity: false,
      devTools: true,
    },
  });

  gameWindow.loadURL(GAME_URLS[game]);

  // Abrir popups externos em novas janelas
  gameWindow.webContents.setWindowOpenHandler(({ url }) => {
    const popup = new BrowserWindow({
      parent: mainWindow!,
      width: 800,
      height: 600,
      webPreferences: {
        contextIsolation: true,
        sandbox: false,
        nodeIntegration: false,
        webSecurity: false,
      },
    });
    popup.loadURL(url);
    return { action: "deny" };
  });

  // Enviar evento para renderer
  mainWindow.webContents.send("game-loaded", game);
}

// IPC Handlers
ipcMain.handle("launch-game", async (_, game: "bonk" | "haxball") => {
  launchGameWindow(game);
  return { success: true };
});

ipcMain.handle("get-current-game", async () => {
  return currentGame;
});

ipcMain.handle("get-app-version", async () => {
  return app.getVersion();
});

ipcMain.handle("quit-and-install", async () => {
  autoUpdater.quitAndInstall();
});

// App lifecycle
app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
