import { app, BrowserWindow, Menu, protocol, ipcMain, dialog, shell } from "electron";
import * as path from "path";
import * as fs from "fs";
import { GameUrls, GameType } from "./types/games.types";
import { autoUpdater } from "electron-updater";
require("dotenv").config();

interface FutheroConfig {
  unlimitedFPS: boolean;
  fpsLimit: number | null;
}

const isDev = require("electron-is-dev");

const configPath = path.join(app.getPath('userData'), 'futhero-config.json');

function loadConfig(): FutheroConfig {
  try {
    if (fs.existsSync(configPath)) {
      const data = fs.readFileSync(configPath, 'utf8');
      const config = JSON.parse(data);
      console.log('[Config] Configuração carregada:', config);
      return config;
    }
  } catch (error) {
    console.error('[Config] Erro ao carregar config:', error);
  }
  console.log('[Config] Usando configuração padrão: Nenhum limite (FPS nativo)');
  return { unlimitedFPS: false, fpsLimit: null };
}

function saveConfig(config: FutheroConfig) {
  try {
    const dir = path.dirname(configPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
    console.log('[Config] ✅ Configuração salva:', config);
  } catch (error) {
    console.error('[Config] ❌ Erro ao salvar config:', error);
  }
}

const config = loadConfig();
let unlimitedFPS = config.unlimitedFPS;
let fpsLimit = config.fpsLimit;
let mainWindow: BrowserWindow | null = null;

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('[FPS] Configuração atual:');
console.log(`[FPS]   unlimitedFPS: ${unlimitedFPS}`);
console.log(`[FPS]   fpsLimit: ${fpsLimit}`);
console.log(`[FPS] Estado: ${unlimitedFPS ? 'DESBLOQUEADO' : fpsLimit ? `LIMITADO A ${fpsLimit}` : 'PADRÃO (sem modificações)'}`);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('[GameUrls] Verificando importação:');
console.log('[GameUrls] GameType:', GameType);
console.log('[GameUrls] GameUrls:', GameUrls);
console.log('[GameUrls] BONKIO:', GameUrls[GameType.BONKIO]);
console.log('[GameUrls] HAXBALL:', GameUrls[GameType.HAXBALL]);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

if (unlimitedFPS) {
  console.log("[FPS] Aplicando flags de FPS ilimitado...");
  app.commandLine.appendSwitch("disable-frame-rate-limit");
  app.commandLine.appendSwitch("disable-gpu-vsync");
} else if (fpsLimit && fpsLimit > 0) {
  console.log(`[FPS] Limite de ${fpsLimit} FPS será aplicado via JavaScript`);
  app.commandLine.appendSwitch("disable-frame-rate-limit");
  app.commandLine.appendSwitch("disable-gpu-vsync");
} else {
  console.log("[FPS] Modo padrão: usando configurações nativas do Electron");
}


autoUpdater.logger = console;
autoUpdater.autoDownload = true;
autoUpdater.allowDowngrade = false;
autoUpdater.allowPrerelease = false;

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
  console.log(`[AutoUpdater] Release Date: ${info.releaseDate}`);
  console.log(`[AutoUpdater] Release Notes: ${info.releaseNotes}`);
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
  console.error("[AutoUpdater] Stack:", err.stack);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  dialog.showErrorBox(
    "Erro na Atualização",
    `Não foi possível verificar atualizações: ${err.message}`
  );
});

autoUpdater.on("download-progress", (progressObj) => {
  console.log(`[AutoUpdater] 📥 Download: ${Math.round(progressObj.percent)}%`);
  console.log(`[AutoUpdater] Velocidade: ${(progressObj.bytesPerSecond / 1024 / 1024).toFixed(2)} MB/s`);
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


function detectGameType(url: string): GameType | null {
  if (url.includes("haxball.com")) return GameType.HAXBALL;
  if (url.includes("bonk.io")) return GameType.BONKIO;
  return null;
}

function getGameScripts(gameType: GameType | null): string[] {
  const isDev = !app.isPackaged;
  const scriptsDir = path.join(__dirname, "scripts");
  const sharedScripts = path.join(scriptsDir, "shared");

  console.log(`[Launcher] isDev: ${isDev}`);
  console.log(`[Launcher] __dirname: ${__dirname}`);
  console.log(`[Launcher] scriptsDir: ${scriptsDir}`);

  let gameSpecificDir: string | null = null;

  if (gameType === GameType.HAXBALL) {
    gameSpecificDir = path.join(scriptsDir, "haxball");
  } else if (gameType === GameType.BONKIO) {
    gameSpecificDir = path.join(scriptsDir, "bonk");
  }

  const allScripts: string[] = [];

  const getScriptsRecursive = (dir: string): string[] => {
    if (!fs.existsSync(dir)) {
      console.log(`[Launcher] Diretório não existe: ${dir}`);
      return [];
    }

    return fs.readdirSync(dir).flatMap((file) => {
      const full = path.join(dir, file);
      const stat = fs.statSync(full);

      if (stat.isDirectory()) return getScriptsRecursive(full);
      return full.endsWith(".js") ? [full] : [];
    });
  };

  if (fs.existsSync(sharedScripts)) {
    allScripts.push(...getScriptsRecursive(sharedScripts));
  }

  if (gameSpecificDir && fs.existsSync(gameSpecificDir)) {
    allScripts.push(...getScriptsRecursive(gameSpecificDir));
  }

  console.log(`[Launcher] Total de scripts encontrados: ${allScripts.length}`);
  return allScripts;
}

let currentGameUrl: string | null = null;

function createWindow() {
  const iconPath = isDev
    ? path.join(__dirname, "../assets/images/icon.ico")
    : path.join(process.resourcesPath, "assets", "images", "icon.ico");

  console.log('[Launcher] Criando janela principal...');
  console.log('[Launcher] Icon path:', iconPath);

  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: fs.existsSync(iconPath) ? iconPath : undefined,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
      webSecurity: false,
      allowRunningInsecureContent: true,
      plugins: true,
    },
  });

  let selectorPath: string;

  if (isDev) {
    selectorPath = path.join(__dirname, "pages/game-selector.html");
  } else {
    selectorPath = path.join(__dirname, "pages", "game-selector.html");
  }

  console.log(`[Launcher] Carregando seletor de jogos de: ${selectorPath}`);
  console.log(`[Launcher] Arquivo existe? ${fs.existsSync(selectorPath)}`);

  if (!fs.existsSync(selectorPath)) {
    console.error(`[Launcher] ❌ Arquivo não encontrado: ${selectorPath}`);
    console.log('[Launcher] __dirname:', __dirname);
    console.log('[Launcher] isDev:', isDev);

    const alternatives = [
      path.join(process.resourcesPath, "pages", "game-selector.html"),
      path.join(process.resourcesPath, "game-selector.html"),
      path.join(__dirname, "../pages/game-selector.html"),
      path.join(__dirname, "../game-selector.html"),
    ];

    for (const alt of alternatives) {
      console.log(`[Launcher] Tentando: ${alt}`);
      if (fs.existsSync(alt)) {
        console.log(`[Launcher] ✅ Encontrado em: ${alt}`);
        selectorPath = alt;
        break;
      }
    }
  }

  try {
    mainWindow.loadFile(selectorPath);
    console.log('[Launcher] ✅ Arquivo carregado com sucesso');
  } catch (error) {
    console.error('[Launcher] ❌ Erro ao carregar arquivo:', error);
  }

  if (app.isPackaged) Menu.setApplicationMenu(null);

  mainWindow.on("page-title-updated", (event) => {
    event.preventDefault();
    mainWindow!.setTitle("Futhero Launcher");
  });

  mainWindow.webContents.on("did-finish-load", () => {
    const currentUrl = mainWindow!.webContents.getURL();

    if (currentUrl.includes("game-selector.html")) {
      console.log("[Launcher] Tela de seleção carregada");
      return;
    }

    const gameType = detectGameType(currentUrl);

    console.log(`[Launcher] Página carregada: ${currentUrl}`);
    console.log(`[Launcher] Jogo detectado: ${gameType || "Desconhecido"}`);

    const scripts = getGameScripts(gameType);

    if (scripts.length === 0) {
      console.log("[Launcher] Nenhum script encontrado!");
      return;
    }

    console.log(`[Launcher] Injetando ${scripts.length} scripts...`);

    setTimeout(() => {
      for (const scriptPath of scripts) {
        try {
          const scriptCode = fs.readFileSync(scriptPath, "utf8");
          mainWindow!.webContents.executeJavaScript(scriptCode);

          const relative = path.relative(
            path.join(__dirname, "scripts"),
            scriptPath
          );
          console.log(`[Launcher] [OK] ${relative}`);
        } catch (error) {
          console.error(
            `[Launcher] ERRO ao injetar ${path.basename(scriptPath)}`,
            error
          );
        }
      }

      console.log("[Launcher] Injeção de scripts concluída.");
    }, 500);
  });

  mainWindow.webContents.setWindowOpenHandler(() => ({ action: "deny" }));

  mainWindow.webContents.on("did-navigate", (event, url) => {
    const newType = detectGameType(url);
    console.log(`[Launcher] Navegação detectada: ${url}`);
    console.log(`[Launcher] Novo jogo: ${newType || "Desconhecido"}`);
  });

  return mainWindow;
}

function getMime(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();

  const mimeTypes: Record<string, string> = {
    ".css": "text/css",
    ".js": "text/javascript",
    ".json": "application/json",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".svg": "image/svg+xml",
    ".html": "text/html",
    ".ico": "image/x-icon",
    ".woff": "font/woff",
    ".woff2": "font/woff2",
    ".ttf": "font/ttf",
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
  const isDev = !app.isPackaged;

  protocol.handle("app", async (request) => {
    try {
      const url = request.url.replace("app://", "");
      const filePath = path.join(__dirname, url);

      console.log(`[Launcher] Protocol handler - URL requisitada: ${url}`);
      console.log(`[Launcher] Protocol handler - Caminho resolvido: ${filePath}`);

      if (!fs.existsSync(filePath)) {
        console.error(`[Launcher] Arquivo não encontrado: ${filePath}`);
        return new Response("Not found", { status: 404 });
      }

      const content = await fs.promises.readFile(filePath);
      return new Response(content, {
        headers: { "content-type": getMime(filePath) },
      });
    } catch (err) {
      console.error("[Launcher] Erro ao carregar recurso:", err);
      return new Response("Internal error", { status: 500 });
    }
  });

  createWindow();

  ipcMain.on("switch-game", (event, type: string) => {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`[Launcher] 🎮 switch-game recebido`);
    console.log(`[Launcher] Tipo recebido: "${type}" (${typeof type})`);
    
    if (!GameUrls[type as GameType]) {
      console.error(`[Launcher] ❌ Tipo de jogo inválido: "${type}"`);
      return;
    }

    currentGameUrl = GameUrls[type as GameType];
    console.log(`[Launcher] ✅ URL encontrada: ${currentGameUrl}`);

    if (mainWindow && currentGameUrl) {
      console.log(`[Launcher] 🚀 Carregando jogo...`);
      mainWindow.loadURL(currentGameUrl);
      console.log(`[Launcher] ✅ Comando loadURL executado`);
    }
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  });

  ipcMain.handle("toggleUnlimitedFPS", async () => {
    unlimitedFPS = !unlimitedFPS;
    if (unlimitedFPS) {
      fpsLimit = null;
    }

    saveConfig({ unlimitedFPS, fpsLimit });
    console.log(`[FPS] Estado alterado e SALVO: ${unlimitedFPS ? 'DESBLOQUEADO' : 'BLOQUEADO'}`);

    const result = await dialog.showMessageBox({
      type: "info",
      title: "FPS Desbloqueado",
      message: unlimitedFPS
        ? "FPS ilimitado ativado! O launcher precisa ser reiniciado para aplicar as mudanças."
        : "FPS limitado reativado! O launcher precisa ser reiniciado para aplicar as mudanças.",
      detail: "Deseja reiniciar agora?",
      buttons: ["Reiniciar", "Depois"],
      defaultId: 0,
      cancelId: 1
    });

    if (result.response === 0) {
      app.relaunch();
      app.quit();
    }

    return unlimitedFPS;
  });

  ipcMain.handle("setFpsLimit", async (event, limit: number | null) => {
    console.log(`[FPS] Definindo limite para: ${limit ?? 'ilimitado'}`);

    if (limit !== null && (typeof limit !== 'number' || limit < 0 || limit > 1000)) {
      console.error('[FPS] Limite inválido:', limit);
      return fpsLimit;
    }

    fpsLimit = limit;
    if (limit !== null) {
      unlimitedFPS = false;
    }

    saveConfig({ unlimitedFPS, fpsLimit });

    const result = await dialog.showMessageBox({
      type: "info",
      title: "Limite de FPS Configurado",
      message: limit
        ? `FPS limitado a ${limit}! O launcher precisa ser reiniciado para aplicar as mudanças.`
        : "Limite de FPS removido! O launcher precisa ser reiniciado.",
      detail: "Deseja reiniciar agora?",
      buttons: ["Reiniciar", "Depois"],
      defaultId: 0,
      cancelId: 1
    });

    if (result.response === 0) {
      app.relaunch();
      app.quit();
    }

    return fpsLimit;
  });

  ipcMain.handle("getFpsLimit", () => {
    console.log(`[FPS] Limite atual: ${fpsLimit ?? 'nenhum'}`);
    return fpsLimit;
  });

  ipcMain.handle("isUnlockedFps", () => {
    console.log(`[FPS] Estado atual: ${unlimitedFPS ? 'DESBLOQUEADO' : 'BLOQUEADO'}`);
    return unlimitedFPS;
  });

  ipcMain.handle("getFpsConfig", () => {
    console.log(`[FPS] Config completa: unlimitedFPS=${unlimitedFPS}, fpsLimit=${fpsLimit}`);
    return { unlimitedFPS, fpsLimit };
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

  ipcMain.on("open-external", (event, url: string) => {
    console.log("[Launcher] Abrindo link externo:", url);
    openExternal(url);
  });

  ipcMain.on("notification", (event, message: string) => {
    if (!message || typeof message !== 'string') {
      console.error("[Launcher] Notificação inválida:", message);
      return;
    }

    console.log("[Launcher] Notificação recebida:", message);

    const sanitizedMessage = String(message)
      .replace(/\\/g, '\\\\')
      .replace(/`/g, '\\`')
      .replace(/\$/g, '\\$')
      .replace(/'/g, "\\'")
      .replace(/"/g, '\\"');

    const notificationScript = `
    (function() {
      const message = "${sanitizedMessage}";
      
      const createNotification = (targetDoc, targetContainer) => {
        const existingNotifications = targetContainer.querySelectorAll('.futhero-notification');
        existingNotifications.forEach(n => n.remove());

        const notification = targetDoc.createElement('div');
        notification.className = 'futhero-notification';
        notification.innerHTML = \`
          <div style="display: flex; align-items: center; gap: 12px;">
            <div style="width: 4px; height: 100%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 2px; position: absolute; left: 0; top: 0;"></div>
            <div style="font-size: 24px; margin-left: 12px;">🔔</div>
            <div style="flex: 1; color: #fff; font-family: 'Segoe UI', Arial, sans-serif; font-size: 14px; font-weight: 500;">\${message}</div>
            <button class="futhero-notification-close" style="background: transparent; border: none; color: #b9bbbe; cursor: pointer; font-size: 20px; padding: 4px 8px; transition: all 0.2s; border-radius: 4px;">✕</button>
          </div>
        \`;
        
        notification.style.cssText = \`
          position: fixed !important;
          top: 20px !important;
          right: 20px !important;
          background: #2f3136 !important;
          border-radius: 8px !important;
          padding: 16px 20px !important;
          min-width: 300px !important;
          max-width: 400px !important;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.8) !important;
          z-index: 2147483647 !important;
          animation: slideIn 0.3s ease-out !important;
          border: 1px solid #40444b !important;
          backdrop-filter: blur(10px) !important;
          pointer-events: auto !important;
        \`;

        if (!targetDoc.querySelector('#futhero-notification-styles')) {
          const style = targetDoc.createElement('style');
          style.id = 'futhero-notification-styles';
          style.textContent = \`
            @keyframes slideIn {
              from { transform: translateX(400px); opacity: 0; }
              to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
              from { transform: translateX(0); opacity: 1; }
              to { transform: translateX(400px); opacity: 0; }
            }
            .futhero-notification-close:hover {
              background: #f04747 !important;
              color: white !important;
            }
            .futhero-notification {
              position: fixed !important;
              z-index: 2147483647 !important;
            }
          \`;
          targetDoc.head.appendChild(style);
        }

        targetContainer.appendChild(notification);

        const removeNotification = () => {
          notification.style.animation = 'slideOut 0.3s ease-out';
          setTimeout(() => {
            if (notification.parentNode) {
              notification.remove();
            }
          }, 300);
        };

        const closeBtn = notification.querySelector('.futhero-notification-close');
        if (closeBtn) {
          closeBtn.addEventListener('click', removeNotification);
        }

        setTimeout(removeNotification, 5000);
      };

      const fullscreenElement = document.fullscreenElement 
        || document.webkitFullscreenElement 
        || document.mozFullScreenElement 
        || document.msFullscreenElement;

      if (fullscreenElement) {
        if (fullscreenElement.id === 'maingameframe') {
          const iframeDoc = fullscreenElement.contentWindow.document;
          const bonkioContainer = iframeDoc.querySelector('#bonkiocontainer');
          if (bonkioContainer) {
            createNotification(iframeDoc, bonkioContainer);
          } else {
            createNotification(iframeDoc, iframeDoc.body);
          }
        } else {
          createNotification(document, fullscreenElement);
        }
      } else {
        const iframe = document.getElementById('maingameframe');
        if (iframe && iframe.contentWindow) {
          const iframeDoc = iframe.contentWindow.document;
          const iframeFullscreenElement = iframeDoc.fullscreenElement 
            || iframeDoc.webkitFullscreenElement 
            || iframeDoc.mozFullScreenElement 
            || iframeDoc.msFullscreenElement;
          
          if (iframeFullscreenElement) {
            createNotification(iframeDoc, iframeFullscreenElement);
          } else {
            createNotification(document, document.body);
          }
        } else {
          createNotification(document, document.body);
        }
      }
    })();
  `;

    event.sender.executeJavaScript(notificationScript)
      .catch(error => {
        console.error('[Notification] Erro ao exibir notificação:', error);
      });
  });

  if (!isDev) {
    console.log("[AutoUpdater] App empacotado, verificando atualizações...");

    setTimeout(() => {
      autoUpdater.checkForUpdates()
        .then((result) => {
          console.log("[AutoUpdater] Verificação iniciada:", result);
        })
        .catch((error) => {
          console.error("[AutoUpdater] Erro ao iniciar verificação:", error);
        });
    }, 3000);

    setInterval(() => {
      console.log("[AutoUpdater] Verificação periódica...");
      autoUpdater.checkForUpdates();
    }, 10 * 60 * 1000);
  } else {
    console.log("[AutoUpdater] Modo DEV, atualizações desabilitadas");
  }

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});