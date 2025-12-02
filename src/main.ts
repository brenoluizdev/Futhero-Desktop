import { app, BrowserWindow, Menu, protocol, ipcMain, dialog, shell, WebPreferences } from "electron";
import * as path from "path";
import * as fs from "fs";
import { GameUrls, GameType } from "./types/games.types";
import { autoUpdater } from "electron-updater";
import { GameManager } from "./handlers/GameManager";
import { BonkHandler } from "./handlers/BonkHandler";

app.commandLine.appendSwitch('no-sandbox');

require("dotenv").config();

const isDev = require("electron-is-dev");
const isBeta = app.getVersion().includes("beta");

if (isBeta) {
  console.log("[AutoUpdater] Versão beta detectada. Permitindo prereleases.");
  autoUpdater.allowPrerelease = true;
} else {
  autoUpdater.allowPrerelease = false;
}

const gameManager = new GameManager();

let mainWindow: BrowserWindow | null = null;
let joinWindow: BrowserWindow | null = null;

autoUpdater.logger = console;
autoUpdater.autoDownload = true;

autoUpdater.on("checking-for-update", () => {
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("[AutoUpdater] 🔍 Verificando atualizações...");
  console.log(`[AutoUpdater] Versão atual: ${app.getVersion()}`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
});

autoUpdater.on("update-available", (info) => {
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("[AutoUpdater] ✅ Nova atualização disponível!");
  console.log(`[AutoUpdater] Versão: ${info.version}`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  dialog.showMessageBox({
    type: "info",
    title: "Atualização Disponível",
    message: `Nova versão ${info.version} disponível!`,
    detail: "Deseja baixar e instalar agora?",
    buttons: ["Sim", "Depois"],
    defaultId: 0,
    cancelId: 1
  }).then((result) => {
    if (result.response === 0) {
      console.log("[AutoUpdater] Usuário aceitou, iniciando download...");
      autoUpdater.downloadUpdate();
    } else {
      console.log("[AutoUpdater] Usuário recusou a atualização");
    }
  });
});

autoUpdater.on("update-not-available", (info) => {
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("[AutoUpdater] ℹ️ Nenhuma atualização disponível");
  console.log(`[AutoUpdater] Versão atual: ${info.version}`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
});

autoUpdater.on("error", (err) => {
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.error("[AutoUpdater] ❌ ERRO:", err);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  dialog.showErrorBox(
    "Erro na Atualização",
    `Não foi possível verificar atualizações: ${err.message}`
  );
});

autoUpdater.on("download-progress", (progressObj) => {
  console.log(`[AutoUpdater] 📥 Download: ${Math.round(progressObj.percent)}%`);
});

autoUpdater.on("update-downloaded", (info) => {
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("[AutoUpdater] ✅ Atualização baixada!");
  console.log(`[AutoUpdater] Versão: ${info.version}`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  dialog.showMessageBox({
    type: "info",
    title: "Atualização Pronta",
    message: `Versão ${info.version} foi baixada.`,
    detail: "O app será reiniciado para instalar a atualização.",
    buttons: ["Reiniciar Agora", "Depois"],
    defaultId: 0
  }).then((result) => {
    if (result.response === 0) {
      console.log("[AutoUpdater] Instalando e reiniciando...");
      setImmediate(() => autoUpdater.quitAndInstall(false, true));
    }
  });
});

const iconPath = isBeta
  ? path.join(process.resourcesPath, "assets", "images", "icon-beta.png")
  : path.join(process.resourcesPath, "assets", "images", "icon.ico");

function createWindow(gameType?: GameType) {
  console.log(`[Launcher] Criando janela para o jogo: ${gameType || 'Seletor'}`);

  let webPrefs: WebPreferences = {
    preload: path.join(__dirname, "preload.js"),
    nodeIntegration: false,
    contextIsolation: true,
    sandbox: false,
    webSecurity: false,
    allowRunningInsecureContent: true,
    plugins: true,
  };

  if (gameType) {
    const handler = gameManager.getHandler(gameType);
    const gameConfig = handler?.getConfig();
    if (gameConfig?.webPreferences) {
      console.log(`[Launcher] Aplicando webPreferences customizadas para ${gameType}:`, gameConfig.webPreferences);
      webPrefs = { ...webPrefs, ...gameConfig.webPreferences };
    }
  }

  console.log('[Launcher] WebPreferences finais para a nova janela:', webPrefs);

  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: fs.existsSync(iconPath) ? iconPath : undefined,
    webPreferences: webPrefs,
  });

  if (!gameType) {
    const selectorPath = isDev
      ? path.join(__dirname, "pages/game-selector.html")
      : path.join(__dirname, "pages", "game-selector.html");

    console.log(`[Launcher] Carregando seletor de jogos de: ${selectorPath}`);
    mainWindow.loadFile(selectorPath).catch(error => {
      console.error('[Launcher] ❌ Erro ao carregar arquivo do seletor:', error);
    });
  }

  if (app.isPackaged) Menu.setApplicationMenu(null);

  mainWindow.on("page-title-updated", (event) => {
    event.preventDefault();
    if (mainWindow && !mainWindow.isDestroyed()) {
      const title = isBeta ? "Futhero Launcher BETA" : "Futhero Launcher";
      mainWindow.setTitle(title);
    }
  });


  mainWindow.webContents.on("did-finish-load", () => {
    if (!mainWindow) return;
    const currentUrl = mainWindow.webContents.getURL();

    if (currentUrl.includes("game-selector.html")) {
      console.log("[Launcher] Tela de seleção carregada.");
      return;
    }

    const detectedGameType = gameManager.detectGameType(currentUrl);
    if (!detectedGameType) {
      console.log("[Launcher] Jogo não reconhecido na URL:", currentUrl);
      return;
    }

    console.log(`[Launcher] Jogo detectado: ${detectedGameType}`);
    const handler = gameManager.getHandler(detectedGameType);
    if (handler) {
      handler.setWindow(mainWindow);
      handler.onPageLoad(mainWindow);
    }
  });

  mainWindow.webContents.setWindowOpenHandler(() => ({ action: "deny" }));

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function getMime(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  const mimeTypes: Record<string, string> = {
    ".css": "text/css", ".js": "text/javascript", ".json": "application/json",
    ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg",
    ".svg": "image/svg+xml", ".html": "text/html", ".ico": "image/x-icon",
    ".woff": "font/woff", ".woff2": "font/woff2", ".ttf": "font/ttf",
  };
  return mimeTypes[ext] || "application/octet-stream";
}

function openExternal(url: string) {
  if (!url || typeof url !== 'string') {
    console.error('[OpenExternal] URL inválida:', url);
    return false;
  }
  try {
    const parsedUrl = new URL(url);
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      console.error('[OpenExternal] Protocolo não permitido:', parsedUrl.protocol);
      return false;
    }
    console.log('[OpenExternal] Abrindo URL:', url);
    shell.openExternal(url);
    return true;
  } catch (error) {
    console.error('[OpenExternal] Erro ao abrir URL:', error);
    return false;
  }
}

app.whenReady().then(() => {
  protocol.handle("app", async (request) => {
    try {
      const url = request.url.replace("app://", "");
      const filePath = path.join(__dirname, url);
      if (!fs.existsSync(filePath)) {
        console.error(`[Launcher] Arquivo não encontrado: ${filePath}`);
        return new Response("Not found", { status: 404 });
      }
      const content = await fs.promises.readFile(filePath);
      return new Response(content, { headers: { "content-type": getMime(filePath) } });
    } catch (err) {
      console.error("[Launcher] Erro ao carregar recurso:", err);
      return new Response("Internal error", { status: 500 });
    }
  });

  const launchGameArg = process.argv.find(arg => arg.startsWith('--launch-game='));

  if (launchGameArg) {
    const gameType = launchGameArg.split('=')[1] as GameType;
    if (GameUrls[gameType]) {
      console.log(`[Launcher] Iniciando diretamente no jogo via flag: ${gameType}`);

      const handler = gameManager.getHandler(gameType);
      handler?.applyCommandLineFlags();

      createWindow(gameType);

      const gameUrl = GameUrls[gameType];
      if (mainWindow && gameUrl) {
        console.log(`[Launcher] ✅ Carregando janela com URL: ${gameUrl}`);
        mainWindow.loadURL(gameUrl);
      }
    } else {
      console.error(`[Launcher] Flag de jogo inválida: ${gameType}. Abrindo seletor.`);
      createWindow();
    }
  } else {
    console.log('[Launcher] Nenhuma flag de jogo detectada. Abrindo o seletor.');
    createWindow();
  }

  ipcMain.on("switch-game", (event, type: string) => {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`[Launcher] 🎮 switch-game recebido: ${type}`);

    const gameType = type as GameType;
    if (!GameUrls[gameType]) {
      console.error(`[Launcher] ❌ Tipo de jogo inválido: "${type}"`);
      return;
    }

    console.log(`[Launcher] Preparando para reiniciar e lançar ${gameType}...`);

    const args = process.argv.slice(1).filter(arg => !arg.startsWith('--launch-game'));
    args.push(`--launch-game=${gameType}`);

    app.relaunch({ args });
    app.quit();
  });

  ipcMain.handle("toggleUnlimitedFPS", async () => {
    const handler = gameManager.getHandler(GameType.BONKIO);
    if (!(handler instanceof BonkHandler)) return false;

    const needsRestart = await handler.toggleUnlimitedFPS();
    const newState = handler.isUnlockedFps();

    if (needsRestart) {
      dialog.showMessageBox({
        type: "info", title: "Mudança de FPS",
        message: newState ? "FPS ilimitado ativado! O launcher precisa ser reiniciado." : "FPS limitado reativado! O launcher precisa ser reiniciado.",
        detail: "Deseja reiniciar agora?", buttons: ["Reiniciar", "Depois"], defaultId: 0, cancelId: 1
      }).then(result => { if (result.response === 0) { app.relaunch(); app.quit(); } });
    }

    return newState;
  });

  ipcMain.handle("setFpsLimit", async (event, limit: number | null) => {
    const handler = gameManager.getHandler(GameType.BONKIO);
    if (!(handler instanceof BonkHandler)) return null;

    const needsRestart = await handler.setFpsLimit(limit);
    const newLimit = handler.getFpsLimit();

    if (needsRestart) {
      dialog.showMessageBox({
        type: "info", title: "Limite de FPS Configurado",
        message: newLimit ? `FPS limitado a ${newLimit}! O launcher precisa ser reiniciado.` : "Limite de FPS removido! O launcher precisa ser reiniciado.",
        detail: "Deseja reiniciar agora?", buttons: ["Reiniciar", "Depois"], defaultId: 0, cancelId: 1
      }).then(result => { if (result.response === 0) { app.relaunch(); app.quit(); } });
    }

    return newLimit;
  });

  ipcMain.handle("getFpsLimit", () => {
    const handler = gameManager.getHandler(GameType.BONKIO);
    return handler instanceof BonkHandler ? handler.getFpsLimit() : null;
  });

  ipcMain.handle("isUnlockedFps", () => {
    const handler = gameManager.getHandler(GameType.BONKIO);
    return handler instanceof BonkHandler ? handler.isUnlockedFps() : false;
  });

  ipcMain.handle("getFpsConfig", () => {
    const handler = gameManager.getHandler(GameType.BONKIO);
    return handler instanceof BonkHandler ? handler.getFpsConfig() : { unlimitedFPS: false, fpsLimit: null };
  });

  ipcMain.handle("fullscreen-element", async (event, selector: string) => {
    if (!selector || typeof selector !== 'string') {
      console.error('[Fullscreen] Seletor inválido:', selector);
      return { success: false, error: 'invalid_selector' };
    }

    const win = BrowserWindow.fromWebContents(event.sender);
    if (!win) {
      console.error('[Fullscreen] Window not found');
      return { success: false, error: "Window not found" };
    }

    try {
      const result = await event.sender.executeJavaScript(`
      (function() {
        const iframe = document.getElementById('maingameframe');
        if (!iframe || !iframe.contentWindow) {
          console.error('[Fullscreen] Iframe não encontrado');
          return { success: false, error: 'iframe_not_found' };
        }

        const iframeDoc = iframe.contentWindow.document;
        const element = iframeDoc.querySelector('${selector}');
        
        if (!element) {
          console.error('[Fullscreen] Elemento não encontrado:', '${selector}');
          return { success: false, error: 'element_not_found' };
        }

        const bgReplay = iframeDoc.querySelector('#bgreplay');
        if (bgReplay) {
          bgReplay.style.textAlign = 'center';
          bgReplay.style.display = 'flex';
          bgReplay.style.alignItems = 'center';
          bgReplay.style.justifyContent = 'center';
          console.log('[Fullscreen] #bgreplay centralizado');
        }

        if (element.requestFullscreen) {
          element.requestFullscreen();
        } else if (element.webkitRequestFullscreen) {
          element.webkitRequestFullscreen();
        } else if (element.mozRequestFullScreen) {
          element.mozRequestFullScreen();
        } else if (element.msRequestFullscreen) {
          element.msRequestFullscreen();
        } else {
          console.error('[Fullscreen] API de fullscreen não suportada');
          return { success: false, error: 'fullscreen_not_supported' };
        }
        
        return { success: true };
      })();
    `);

      console.log('[Fullscreen] Resultado:', result);
      return result || { success: false, error: 'no_result' };

    } catch (error: any) {
      console.error('[Fullscreen] Erro ao aplicar fullscreen:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.on('open-join-window', () => {
    if (joinWindow) {
      joinWindow.focus();
      return;
    }

    joinWindow = new BrowserWindow({
      icon: fs.existsSync(iconPath) ? iconPath : undefined,
      width: 500,
      height: 200,
      resizable: false,
      autoHideMenuBar: true,
      title: "Join Room",
      webPreferences: {
        preload: path.join(__dirname, "preload.js"),
        nodeIntegration: false,
        contextIsolation: true,
        sandbox: false
      }
    });

    let selectorPath: string;

    if (isDev) {
      selectorPath = path.join(__dirname, "pages/join-room.html");
    } else {
      selectorPath = path.join(__dirname, "pages", "join-room.html");
    }

    console.log('[JoinWindow] Carregando:', selectorPath);
    console.log('[JoinWindow] Preload path:', path.join(__dirname, "preload.js"));

    joinWindow.loadFile(selectorPath);

    joinWindow.on('closed', () => {
      joinWindow = null;
    });
  });

  ipcMain.on('join-room', (event, link) => {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('[JoinRoom] Evento "join-room" recebido!');
    console.log('[JoinRoom] Link recebido:', link);
    console.log('[JoinRoom] Tipo do link:', typeof link);

    const allWindows = BrowserWindow.getAllWindows();
    console.log('[JoinRoom] Total de janelas abertas:', allWindows.length);

    allWindows.forEach((win, index) => {
      console.log(`[JoinRoom] Janela ${index}:`, win.getTitle());
    });

    const targetWindow = allWindows.find(win => win !== joinWindow);

    if (targetWindow) {
      console.log('[JoinRoom] Janela principal encontrada:', targetWindow.getTitle());
      console.log('[JoinRoom] URL atual:', targetWindow.webContents.getURL());
      console.log('[JoinRoom] Carregando novo link:', link);

      try {
        targetWindow.loadURL(link);
        console.log('[JoinRoom] ✅ loadURL executado com sucesso');

        setTimeout(() => {
          if (joinWindow && !joinWindow.isDestroyed()) {
            console.log('[JoinRoom] Fechando janela de join...');
            joinWindow.close();
          }
        }, 500);

      } catch (error) {
        console.error('[JoinRoom] ❌ Erro ao carregar URL:', error);
      }
    } else {
      console.error('[JoinRoom] ❌ Janela principal não encontrada!');
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  });

  ipcMain.handle("exit-fullscreen", async (event) => {
    try {
      const result = await event.sender.executeJavaScript(`
      (function() {
        const iframe = document.getElementById('maingameframe');
        if (iframe && iframe.contentWindow) {
          const iframeDoc = iframe.contentWindow.document;
          const bgReplay = iframeDoc.querySelector('#bgreplay');
          if (bgReplay) {
            bgReplay.style.textAlign = '';
            bgReplay.style.display = '';
            bgReplay.style.alignItems = '';
            bgReplay.style.justifyContent = '';
            console.log('[Fullscreen] #bgreplay restaurado ao estilo original');
          }
        }

        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
        } else if (document.mozCancelFullScreen) {
          document.mozCancelFullScreen();
        } else if (document.msExitFullscreen) {
          document.msExitFullscreen();
        }
        
        return { success: true };
      })();
    `);

      console.log('[Fullscreen] Saiu do fullscreen');
      return result || { success: true };

    } catch (error: any) {
      console.error('[Fullscreen] Erro ao sair do fullscreen:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.on("open-external", (event, url: string) => openExternal(url));

  ipcMain.on("notification", (event, message: string) => {
    if (!message || typeof message !== 'string') return;
    const sanitizedMessage = String(message).replace(/[`\\$']/g, '\\$&').replace(/"/g, '\\"');
    event.sender.executeJavaScript(`...`)
      .catch(error => console.error('[Notification] Erro:', error));
  });

  if (!isDev) {
    console.log("[AutoUpdater] Verificando atualizações na inicialização...");
    setTimeout(() => autoUpdater.checkForUpdates().catch(error => console.error("[AutoUpdater] Erro:", error)), 3000);
    setInterval(() => autoUpdater.checkForUpdates(), 10 * 60 * 1000);
  }

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});