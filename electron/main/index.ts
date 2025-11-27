import {
  app,
  BrowserWindow,
  BrowserView,
  ipcMain,
  Menu,
  dialog,
} from "electron";
import pkg from "electron-updater";
const { autoUpdater } = pkg;
import path from "path";
import { fileURLToPath } from "url";
import isDev from "electron-is-dev";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configurações de auto-update
autoUpdater.checkForUpdatesAndNotify();

let mainWindow: BrowserWindow | null = null;
let currentGameView: BrowserView | null = null;
let currentGame: "bonk" | "haxball" | null = null;

const PRELOAD_PATH = path.join(__dirname, "./preload/preload.js");
const RENDERER_PATH = isDev
  ? "http://localhost:5173"
  : `file://${path.join(__dirname, "../../dist/index.html")}`;

/**
 * Cria a janela principal do launcher
 */
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      preload: PRELOAD_PATH,
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true,
    },
    icon: path.join(__dirname, "./assets/icon.ico"),
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

  // Criar menu da aplicação
  createApplicationMenu();
}

/**
 * Cria o menu da aplicação
 */
function createApplicationMenu() {
  const template: any[] = [
    {
      label: "Arquivo",
      submenu: [
        {
          label: "Sair",
          accelerator: "CmdOrCtrl+Q",
          click: () => {
            app.quit();
          },
        },
      ],
    },
    {
      label: "Editar",
      submenu: [
        { label: "Desfazer", accelerator: "CmdOrCtrl+Z", role: "undo" },
        { label: "Refazer", accelerator: "CmdOrCtrl+Y", role: "redo" },
        { type: "separator" },
        { label: "Cortar", accelerator: "CmdOrCtrl+X", role: "cut" },
        { label: "Copiar", accelerator: "CmdOrCtrl+C", role: "copy" },
        { label: "Colar", accelerator: "CmdOrCtrl+V", role: "paste" },
      ],
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
          },
        },
      ],
    },
    {
      label: "Ajuda",
      submenu: [
        {
          label: "Sobre",
          click: () => {
            dialog.showMessageBox(mainWindow!, {
              type: "info",
              title: "Sobre Game Launcher",
              message: "Game Launcher - Bonk.io & Haxball",
              detail:
                "Versão 1.0.0\n\nUm launcher profissional para seus jogos favoritos.",
            });
          },
        },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

/**
 * Abre um jogo em um BrowserView
 */
function openGame(gameUrl: string, gameName: "bonk" | "haxball") {
  if (!mainWindow) return;

  // Destruir view anterior se existir
  if (currentGameView) {
    mainWindow.removeBrowserView(currentGameView);
  }

  // Criar novo BrowserView
  currentGameView = new BrowserView({
    webPreferences: {
      preload: PRELOAD_PATH,
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true,
    },
  });

  mainWindow.addBrowserView(currentGameView);

  // Configurar bounds do BrowserView para ocupar toda a janela
  const { width, height } = mainWindow.getContentBounds();
  currentGameView.setBounds({ x: 0, y: 0, width, height });

  // Carregar o jogo
  currentGameView.webContents.loadURL(gameUrl);
  currentGame = gameName;

  // Injetar o script de UI quando o jogo carregar
  currentGameView.webContents.on("did-finish-load", () => {
    injectGameUI(gameName);
  });

  // Redimensionar BrowserView quando a janela for redimensionada
  mainWindow.on("resize", () => {
    if (currentGameView && mainWindow) {
      const { width, height } = mainWindow.getContentBounds();
      currentGameView.setBounds({ x: 0, y: 0, width, height });
    }
  });
}

/**
 * Injeta a UI do modal no jogo
 */
function injectGameUI(gameName: "bonk" | "haxball") {
  if (!currentGameView) return;

  // Ler o arquivo de injeção
  const injectorPath = isDev
  ? path.join(process.cwd(), "electron/injector/injector.js")
  : path.join(__dirname, "injector/injector.js");
  const fs = require("fs");

  try {
    const injectorCode = fs.readFileSync(injectorPath, "utf-8");
    currentGameView.webContents.executeJavaScript(injectorCode);
  } catch (error) {
    console.error("Erro ao injetar UI:", error);
  }
}

/**
 * Listeners IPC
 */
ipcMain.handle("open-game", async (event, gameName: "bonk" | "haxball") => {
  const gameUrls = {
    bonk: "https://bonk.io",
    haxball: "https://haxball.com",
  };
  
  openGame(gameUrls[gameName], gameName);
  return { success: true };
});

ipcMain.handle("close-game", async () => {
  if (currentGameView && mainWindow) {
    mainWindow.removeBrowserView(currentGameView);
    currentGameView = null;
    currentGame = null;
  }
  return { success: true };
});

ipcMain.handle("get-current-game", async () => {
  return { game: currentGame };
});

ipcMain.handle("check-for-updates", async () => {
  try {
    const result = await autoUpdater.checkForUpdates();
    return { hasUpdate: result?.updateInfo?.version !== app.getVersion() };
  } catch (error) {
    console.error("Erro ao verificar atualizações:", error);
    return { hasUpdate: false };
  }
});

ipcMain.handle("get-app-version", async () => {
  return { version: app.getVersion() };
});


/**
 * Eventos do app
 */
app.on("ready", createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (mainWindow === null) {
    createWindow();
  }
});

// Tratamento global de erro
process.on("uncaughtException", error => {
  console.error("Erro não capturado:", error);
});