"use strict";
const electron = require("electron");
const pkg = require("electron-updater");
const path = require("path");
const url = require("url");
var _documentCurrentScript = typeof document !== "undefined" ? document.currentScript : null;
if (typeof electron === "string") {
  throw new TypeError("Not running in an Electron environment!");
}
const { env } = process;
const isEnvSet = "ELECTRON_IS_DEV" in env;
const getFromEnv = Number.parseInt(env.ELECTRON_IS_DEV, 10) === 1;
const isDev = isEnvSet ? getFromEnv : !electron.app.isPackaged;
const { autoUpdater } = pkg;
const __filename$1 = url.fileURLToPath(typeof document === "undefined" ? require("url").pathToFileURL(__filename).href : _documentCurrentScript && _documentCurrentScript.tagName.toUpperCase() === "SCRIPT" && _documentCurrentScript.src || new URL("index.cjs", document.baseURI).href);
const __dirname$1 = path.dirname(__filename$1);
autoUpdater.checkForUpdatesAndNotify();
let mainWindow = null;
let currentGameView = null;
let currentGame = null;
const PRELOAD_PATH = path.join(__dirname$1, "./preload/preload.js");
const RENDERER_PATH = isDev ? "http://localhost:5173" : `file://${path.join(__dirname$1, "../../dist/index.html")}`;
function createWindow() {
  mainWindow = new electron.BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      preload: PRELOAD_PATH,
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true
    },
    icon: path.join(__dirname$1, "../../assets/icon.png")
  });
  if (isDev) {
    mainWindow.webContents.openDevTools();
    mainWindow.loadURL(RENDERER_PATH);
  } else {
    mainWindow.loadURL(RENDERER_PATH);
  }
  mainWindow.on("closed", () => {
    if (currentGameView && mainWindow) {
      mainWindow.removeBrowserView(currentGameView);
      currentGameView = null;
    }
    mainWindow = null;
  });
  createApplicationMenu();
}
function createApplicationMenu() {
  const template = [
    {
      label: "Arquivo",
      submenu: [
        {
          label: "Sair",
          accelerator: "CmdOrCtrl+Q",
          click: () => {
            electron.app.quit();
          }
        }
      ]
    },
    {
      label: "Editar",
      submenu: [
        { label: "Desfazer", accelerator: "CmdOrCtrl+Z", role: "undo" },
        { label: "Refazer", accelerator: "CmdOrCtrl+Y", role: "redo" },
        { type: "separator" },
        { label: "Cortar", accelerator: "CmdOrCtrl+X", role: "cut" },
        { label: "Copiar", accelerator: "CmdOrCtrl+C", role: "copy" },
        { label: "Colar", accelerator: "CmdOrCtrl+V", role: "paste" }
      ]
    },
    {
      label: "Exibir",
      submenu: [
        { label: "Recarregar", accelerator: "CmdOrCtrl+R", role: "reload" },
        {
          label: "Ferramentas de Desenvolvimento",
          accelerator: "F12",
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.toggleDevTools();
            }
          }
        }
      ]
    },
    {
      label: "Ajuda",
      submenu: [
        {
          label: "Sobre",
          click: () => {
            electron.dialog.showMessageBox(mainWindow, {
              type: "info",
              title: "Sobre Game Launcher",
              message: "Game Launcher - Bonk.io & Haxball",
              detail: "Versão 1.0.0\n\nUm launcher profissional para seus jogos favoritos."
            });
          }
        }
      ]
    }
  ];
  const menu = electron.Menu.buildFromTemplate(template);
  electron.Menu.setApplicationMenu(menu);
}
function openGame(gameUrl, gameName) {
  if (!mainWindow) return;
  if (currentGameView) {
    mainWindow.removeBrowserView(currentGameView);
  }
  currentGameView = new electron.BrowserView({
    webPreferences: {
      preload: PRELOAD_PATH,
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true
    }
  });
  mainWindow.addBrowserView(currentGameView);
  const { width, height } = mainWindow.getContentBounds();
  currentGameView.setBounds({ x: 0, y: 0, width, height });
  currentGameView.webContents.loadURL(gameUrl);
  currentGame = gameName;
  currentGameView.webContents.on("did-finish-load", () => {
    injectGameUI();
  });
  mainWindow.on("resize", () => {
    if (currentGameView && mainWindow) {
      const { width: width2, height: height2 } = mainWindow.getContentBounds();
      currentGameView.setBounds({ x: 0, y: 0, width: width2, height: height2 });
    }
  });
}
function injectGameUI(gameName) {
  if (!currentGameView) return;
  const injectorPath = isDev ? path.join(process.cwd(), "electron/injector/injector.js") : path.join(__dirname$1, "injector/injector.js");
  const fs = require("fs");
  try {
    const injectorCode = fs.readFileSync(injectorPath, "utf-8");
    currentGameView.webContents.executeJavaScript(injectorCode);
  } catch (error) {
    console.error("Erro ao injetar UI:", error);
  }
}
electron.ipcMain.handle("open-game", async (event, gameName) => {
  const gameUrls = {
    bonk: "https://bonk.io",
    haxball: "https://haxball.com"
  };
  openGame(gameUrls[gameName], gameName);
  return { success: true };
});
electron.ipcMain.handle("close-game", async () => {
  if (currentGameView && mainWindow) {
    mainWindow.removeBrowserView(currentGameView);
    currentGameView = null;
    currentGame = null;
  }
  return { success: true };
});
electron.ipcMain.handle("get-current-game", async () => {
  return { game: currentGame };
});
electron.ipcMain.handle("check-for-updates", async () => {
  try {
    const result = await autoUpdater.checkForUpdates();
    return { hasUpdate: result?.updateInfo?.version !== electron.app.getVersion() };
  } catch (error) {
    console.error("Erro ao verificar atualizações:", error);
    return { hasUpdate: false };
  }
});
electron.ipcMain.handle("get-app-version", async () => {
  return { version: electron.app.getVersion() };
});
electron.app.on("ready", createWindow);
electron.app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    electron.app.quit();
  }
});
electron.app.on("activate", () => {
  if (mainWindow === null) {
    createWindow();
  }
});
process.on("uncaughtException", (error) => {
  console.error("Erro não capturado:", error);
});
//# sourceMappingURL=index.cjs.map
