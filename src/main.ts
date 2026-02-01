import { app, BrowserWindow, Menu, protocol, ipcMain, dialog, shell, WebPreferences } from "electron";
import * as path from "path";
import * as fs from "fs";
import { GameUrls, GameType } from "./types/games.types";
import { autoUpdater } from "electron-updater";
import { GameManager } from "./handlers/GameManager";
import { BonkHandler } from "./handlers/BonkHandler";
import { ADS_CONTENT, getRandomAd } from "./types/ads.types";
import { AuthManager } from "./AuthManager";

app.commandLine.appendSwitch('no-sandbox');

require("dotenv").config();

const appVersion = app.getVersion();

console.log(`[Launcher] Versão do app: ${appVersion}`);

autoUpdater.logger = console;
autoUpdater.autoDownload = false;
autoUpdater.allowDowngrade = false;
autoUpdater.allowPrerelease = false;
autoUpdater.channel = "latest";

autoUpdater.setFeedURL({
  provider: 'github',
  owner: 'brenoluizdev',
  repo: 'Futhero-Desktop',
  private: false
});

console.log("[AutoUpdater] Configuração:");
console.log("  - Canal:", autoUpdater.channel);
console.log("  - Feed URL configurada para GitHub");
console.log("  - Provider: github");
console.log("  - Owner: brenoluizdev");
console.log("  - Repo: Futhero-Desktop");

const gameManager = new GameManager();
const authManager = new AuthManager();

let mainWindow: BrowserWindow | null = null;
let joinWindow: BrowserWindow | null = null;
let adWindow: BrowserWindow | null = null;

autoUpdater.on("checking-for-update", () => {
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("[AutoUpdater] 🔍 Verificando atualizações...");
  console.log(`[AutoUpdater] Versão atual: ${appVersion}`);
  console.log(`[AutoUpdater] Canal: ${autoUpdater.channel}`);
  console.log(`[AutoUpdater] Prerelease: ${autoUpdater.allowPrerelease}`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
});

autoUpdater.on("update-available", (info) => {
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("[AutoUpdater] ✅ Nova atualização disponível!");
  console.log(`[AutoUpdater] Versão disponível: ${info.version}`);
  console.log(`[AutoUpdater] Versão atual: ${appVersion}`);
  console.log("[AutoUpdater] Info completa:", JSON.stringify(info, null, 2));
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
  console.log(`[AutoUpdater] Versão atual: ${appVersion}`);
  console.log("[AutoUpdater] Info:", JSON.stringify(info, null, 2));
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
});

autoUpdater.on("error", (err) => {
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.error("[AutoUpdater] ❌ ERRO:", err);
  console.error("[AutoUpdater] Message:", err.message);
  console.error("[AutoUpdater] Stack:", err.stack);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
});

autoUpdater.on("download-progress", (progressObj) => {
  console.log(`[AutoUpdater] 📥 Download: ${Math.round(progressObj.percent)}% - ${Math.round(progressObj.bytesPerSecond / 1024)}KB/s`);
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

const iconPath = path.join(__dirname, "assets", "images", "icon.ico");

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

  authManager.setMainWindow(mainWindow);

  if (!gameType) {
    const selectorPath = path.join(__dirname, "pages", "game-selector.html");

    console.log(`[Launcher] Carregando seletor de jogos de: ${selectorPath}`);
    mainWindow.loadFile(selectorPath).catch(error => {
      console.error('[Launcher] ❌ Erro ao carregar arquivo do seletor:', error);
    });
  }

  if (app.isPackaged) Menu.setApplicationMenu(null);

  mainWindow.on("page-title-updated", (event) => {
    event.preventDefault();
    if (mainWindow && !mainWindow.isDestroyed()) {
      const title = "Futhero Launcher";
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

function createAdWindow() {
  if (adWindow && !adWindow.isDestroyed()) {
    adWindow.focus();
    return;
  }

  console.log('[AdWindow] Criando janela de anúncio...');

  const randomAd = getRandomAd();
  console.log('[AdWindow] Anúncio selecionado:', randomAd.id);

  adWindow = new BrowserWindow({
    width: 550,
    height: 650,
    minHeight: 500,
    maxHeight: 800,
    frame: false,
    transparent: false,
    resizable: true,
    alwaysOnTop: true,
    center: true,
    icon: fs.existsSync(iconPath) ? iconPath : undefined,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false
    }
  });

  adWindow.webContents.on('did-finish-load', () => {
    adWindow?.webContents.executeJavaScript(`
      localStorage.setItem('currentAd', '${JSON.stringify(randomAd).replace(/'/g, "\\'")}');
      window.dispatchEvent(new Event('DOMContentLoaded'));
    `);
  });

  const adPath = path.join(__dirname, "pages", "ad-window.html");
  console.log('[AdWindow] Carregando página:', adPath);

  adWindow.loadFile(adPath);

  adWindow.on('closed', () => {
    console.log('[AdWindow] Janela de anúncio fechada');
    adWindow = null;
  });

  setTimeout(() => {
    if (adWindow && !adWindow.isDestroyed()) {
      console.log('[AdWindow] Fechando anúncio automaticamente (timeout)');
      adWindow.close();
    }
  }, 45000);
}

function shouldShowAd(): boolean {
  return true;
  const lastAdShown = parseInt(fs.readFileSync(
    path.join(app.getPath('userData'), 'last-ad-shown.txt'),
    'utf-8'
  ).trim() || '0', 10);

  const now = Date.now();
  const hoursSinceLastAd = (now - lastAdShown) / (1000 * 60 * 60);

  return hoursSinceLastAd >= 5;
}

function saveAdTimestamp() {
  const userDataPath = app.getPath('userData');
  const filePath = path.join(userDataPath, 'last-ad-shown.txt');

  if (!fs.existsSync(userDataPath)) {
    fs.mkdirSync(userDataPath, { recursive: true });
  }

  fs.writeFileSync(filePath, Date.now().toString(), 'utf-8');
  console.log('[AdWindow] Timestamp do anúncio salvo');
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

  setTimeout(() => {
    try {
      if (shouldShowAd()) {
        console.log('[AdWindow] Mostrando anúncio de inicialização...');
        createAdWindow();
        saveAdTimestamp();
      } else {
        console.log('[AdWindow] Anúncio já foi exibido recentemente');
      }
    } catch (error) {
      console.error('[AdWindow] Erro ao verificar/mostrar anúncio:', error);
      createAdWindow();
      saveAdTimestamp();
    }
  }, 3000);

  // Auth IPCs - Limpando handlers anteriores para evitar duplicação
  ipcMain.removeHandler('auth:check');
  ipcMain.removeHandler('auth:login');
  ipcMain.removeHandler('auth:logout');
  
  ipcMain.handle('auth:check', async () => {
    return await authManager.validateToken();
  });

  ipcMain.handle('auth:login', async () => {
    await authManager.startLoginFlow();
  });

  ipcMain.handle('auth:logout', async () => {
    return authManager.logout();
  });

  ipcMain.on("close-window", () => mainWindow?.close());

  // Removendo listeners antigos para evitar duplicação
  ipcMain.removeAllListeners('auth:start');
  
  ipcMain.on('auth:start', () => authManager.startLoginFlow());
  // Removidos handlers duplicados que causavam erro (linhas 394-395)
  
  ipcMain.removeAllListeners('switch-game');
  ipcMain.on("switch-game", (event, type: string) => {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`[Launcher] 🎮 switch-game recebido. Raw type: "${type}"`);
    console.log(`[Launcher] Tipos válidos:`, Object.keys(GameUrls));

    // Normalização para garantir compatibilidade
    let gameType = type as GameType;
    
    // Tenta encontrar o tipo correspondente (case-insensitive) se não achar direto
    if (!GameUrls[gameType]) {
        const foundType = Object.keys(GameUrls).find(k => k.toUpperCase() === type.toUpperCase());
        if (foundType) {
            gameType = foundType as GameType;
            console.log(`[Launcher] ⚠️ Tipo corrigido para: ${gameType}`);
        }
    }

    if (!GameUrls[gameType]) {
      console.error(`[Launcher] ❌ Tipo de jogo inválido: "${type}"`);
      event.sender.send('error:game-launch', `Jogo inválido: ${type}`);
      return;
    }

    console.log(`[Launcher] Preparando para reiniciar e lançar ${gameType}...`);

    // Em desenvolvimento, precisamos ajustar os argumentos
    // Se não estiver empacotado, o primeiro argumento é o executável do electron e o segundo é o script (.)
    // Mas app.relaunch() em dev geralmente lida com isso se passarmos os args certos.
    
    const args = process.argv.slice(1).filter(arg => !arg.startsWith('--launch-game'));
    args.push(`--launch-game=${gameType}`);
    
    console.log('[Launcher] Args para relaunch:', args);

    app.relaunch({ args });
    app.quit();
  });

  ipcMain.handle("toggleUnlimitedFPS", async () => {
    const handler = gameManager.getHandler(GameType.BONKIO);
    if (!(handler instanceof BonkHandler)) return false;

    const oldState = handler.isUnlockedFps();
    await handler.toggleUnlimitedFPS();
    const newState = handler.isUnlockedFps();

    if (oldState !== newState) {
      const response = await dialog.showMessageBox({
        type: "info",
        title: "Mudança de FPS",
        message: newState
          ? "FPS ilimitado ativado! O launcher precisa ser reiniciado."
          : "FPS limitado reativado! O launcher precisa ser reiniciado.",
        detail: "Deseja reiniciar agora?",
        buttons: ["Reiniciar", "Depois"],
        defaultId: 0,
        cancelId: 1
      });

      if (response.response === 0) {
        console.log("[FPS] Reiniciando aplicação...");
        app.relaunch();
        app.quit();
      }
    }

    return newState;
  });

  ipcMain.handle("setFpsLimit", async (event, limit: number | null) => {
    const handler = gameManager.getHandler(GameType.BONKIO);
    if (!(handler instanceof BonkHandler)) return null;

    const wasUnlimited = handler.isUnlockedFps();
    const needsAppRestart = await handler.setFpsLimit(limit);
    const newLimit = handler.getFpsLimit();

    if (needsAppRestart && wasUnlimited) {
      const response = await dialog.showMessageBox({
        type: "info",
        title: "Limite de FPS Configurado",
        message: newLimit
          ? `FPS limitado a ${newLimit}! O launcher precisa ser reiniciado.`
          : "Modo padrão ativado! O launcher precisa ser reiniciado.",
        detail: "Deseja reiniciar agora?",
        buttons: ["Reiniciar", "Depois"],
        defaultId: 0,
        cancelId: 1
      });

      if (response.response === 0) {
        console.log("[FPS] Reiniciando aplicação...");
        app.relaunch();
        app.quit();
      }
    } else if (mainWindow) {
      const response = await dialog.showMessageBox({
        type: "info",
        title: "Limite de FPS Configurado",
        message: newLimit
          ? `FPS limitado a ${newLimit}! A página precisa ser recarregada.`
          : "Modo padrão ativado! A página precisa ser recarregada.",
        detail: "Deseja recarregar agora?",
        buttons: ["Recarregar", "Depois"],
        defaultId: 0,
        cancelId: 1
      });

      if (response.response === 0) {
        console.log("[FPS] Recarregando página...");
        mainWindow.webContents.reload();
      }
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
    return handler instanceof BonkHandler
      ? handler.getFpsConfig()
      : { unlimitedFPS: false, fpsLimit: null, isDefault: true };
  });

  ipcMain.handle("set-frame-rate", async (event, number: number) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (!win) {
      console.error('[Fullscreen] Window not found');
      return { success: false, error: "Window not found" };
    }
    win.webContents.setFrameRate(number);
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

        const gameRenderer = iframeDoc.querySelector('#gamerenderer');
        if (gameRenderer) {
          gameRenderer.style.textAlign = 'center';
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

    let selectorPath = path.join(__dirname, "pages", "join-room.html");

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
    event.sender.executeJavaScript(`
      (function() {
        const notification = document.createElement('div');
        notification.textContent = "${sanitizedMessage}";
        notification.style.cssText = 'position:fixed;top:20px;right:20px;background:#333;color:#fff;padding:15px;border-radius:5px;z-index:9999';
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
      })();
    `).catch(error => console.error('[Notification] Erro:', error));
  });

  // Auth Handlers
  ipcMain.on('auth:start', () => {
    authManager.startLoginFlow();
  });

  ipcMain.handle('auth:check', async () => {
    return await authManager.validateToken();
  });

  ipcMain.handle('auth:logout', () => {
    return authManager.logout();
  });

  if (app.isPackaged) {
    console.log("[AutoUpdater] App empacotado detectado. Verificando atualizações em 3s...");
    setTimeout(() => {
      console.log("[AutoUpdater] Iniciando verificação de atualização...");
      autoUpdater.checkForUpdates()
        .then(result => {
          console.log("[AutoUpdater] Resultado da verificação:", result);
        })
        .catch(error => {
          console.error("[AutoUpdater] Erro ao verificar:", error);
        });
    }, 3000);

    setInterval(() => {
      console.log("[AutoUpdater] Verificação periódica iniciada...");
      autoUpdater.checkForUpdates();
    }, 10 * 60 * 1000);
  } else {
    console.log("[AutoUpdater] Modo desenvolvimento - auto-updater desativado");
  }

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});