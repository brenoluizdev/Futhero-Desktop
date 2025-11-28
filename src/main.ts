import { app, BrowserWindow, Menu, protocol, ipcMain, dialog } from "electron";
import * as path from "path";
import * as fs from "fs";
import { GameUrls, GameType } from "./types/games.types";
import { autoUpdater } from "electron-updater";
require("dotenv").config();

const isDev = require("electron-is-dev");

autoUpdater.logger = console;
autoUpdater.autoDownload = true;
autoUpdater.allowDowngrade = false;
autoUpdater.allowPrerelease = false; // Mude para true se quiser testar com pre-releases

// IMPORTANTE: Force verificação mesmo se estiver na mesma versão (apenas para debug)
// autoUpdater.forceDevUpdateConfig = true; // Descomente se precisar testar em dev

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

let currentGameUrl = GameUrls[GameType.BONKIO];

function createWindow() {
  const iconPath = isDev
    ? path.join(__dirname, "../assets/images/icon.ico")
    : path.join(process.resourcesPath, "assets", "images", "icon.ico");

  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: iconPath,
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

  mainWindow.loadURL(currentGameUrl);

  if (app.isPackaged) Menu.setApplicationMenu(null);

  mainWindow.on("page-title-updated", (event) => {
    event.preventDefault();
    mainWindow.setTitle("Futhero Launcher");
  });

  mainWindow.webContents.on("did-finish-load", () => {
    const currentUrl = mainWindow.webContents.getURL();
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
          mainWindow.webContents.executeJavaScript(scriptCode);

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

  const mainWindow = createWindow();

  // ============= VERIFICAR ATUALIZAÇÕES =============
  if (!isDev) {
    console.log("[AutoUpdater] App empacotado, verificando atualizações...");

    // Aguarda 3 segundos após o app carregar para verificar
    setTimeout(() => {
      autoUpdater.checkForUpdates()
        .then((result) => {
          console.log("[AutoUpdater] Verificação iniciada:", result);
        })
        .catch((error) => {
          console.error("[AutoUpdater] Erro ao iniciar verificação:", error);
        });
    }, 3000);

    // Verificar a cada 10 minutos
    setInterval(() => {
      console.log("[AutoUpdater] Verificação periódica...");
      autoUpdater.checkForUpdates();
    }, 10 * 60 * 1000);
  } else {
    console.log("[AutoUpdater] Modo DEV, atualizações desabilitadas");
  }
  // ============= FIM VERIFICAÇÃO ATUALIZAÇÕES =============

  ipcMain.on("switch-game", (event, type: GameType) => {
    console.log(`[Launcher] Trocando para: ${type}`);
    currentGameUrl = GameUrls[type];
    mainWindow.loadURL(currentGameUrl);
  });

  ipcMain.handle("fullscreen-element", async (event, selector: string) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (!win) return { success: false, error: "Window not found" };

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

  ipcMain.on("notification", (event, message: string) => {
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

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});