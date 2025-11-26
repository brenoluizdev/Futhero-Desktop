"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const electron_2 = require("electron");
const isDev = !electron_1.app.isPackaged;
let mainWindow = null;
function createWindow() {
    mainWindow = new electron_1.BrowserWindow({
        width: 1200,
        height: 800,
        resizable: true,
        autoHideMenuBar: true,
        icon: path.join(__dirname, "../assets/icon.ico"),
        webPreferences: {
            contextIsolation: true,
            nodeIntegration: false,
            preload: path.join(__dirname, "../preload/preload.js"),
            webSecurity: false,
            allowRunningInsecureContent: true,
            devTools: isDev,
            // Performance otimizations
            backgroundThrottling: false, // Não reduz FPS quando em background
            offscreen: false,
        },
    });
    mainWindow.on("page-title-updated", (event) => event.preventDefault());
    mainWindow.setTitle("Futhero Launcher");
    mainWindow.loadFile(path.join(__dirname, "../renderer/index.html"));
    mainWindow.webContents.on("did-navigate", async (_event, url) => {
        injectScriptsForURL(url);
    });
    // As configurações serão aplicadas quando o usuário clicar em "Aplicar"
}
// Função para aplicar configurações de performance ao Electron
function applyPerformanceToWindow(settings) {
    if (!mainWindow)
        return;
    console.log("[Performance] Aplicando configurações:", settings);
    // Unlock FPS - desabilitar limitador de FPS do Chromium
    if (settings.unlockFPS) {
        mainWindow.webContents.setFrameRate(0); // 0 = sem limite
        console.log("[Performance] ✓ FPS desbloqueado");
    }
    else {
        mainWindow.webContents.setFrameRate(60);
    }
    // Disable Animations
    if (settings.disableAnimations) {
        mainWindow.webContents.executeJavaScript(`
      const style = document.createElement('style');
      style.id = 'fh-disable-animations';
      style.textContent = \`
        *, *::before, *::after {
          animation-duration: 0s !important;
          animation-delay: 0s !important;
          transition-duration: 0s !important;
          transition-delay: 0s !important;
        }
      \`;
      document.head.appendChild(style);
    `);
        console.log("[Performance] ✓ Animações desativadas");
    }
}
function injectScriptsForURL(url) {
    if (!mainWindow)
        return;
    let folder = "";
    if (url.includes("bonk.io"))
        folder = "bonk";
    else if (url.includes("haxball.com"))
        folder = "haxball";
    else
        return;
    const sharedDir = path.join(__dirname, "../scripts/shared");
    const gameDir = path.join(__dirname, `../scripts/${folder}`);
    const cssDir = path.join(__dirname, "../css");
    // Função para injetar CSS
    const injectCSS = (cssPath) => {
        if (!fs.existsSync(cssPath)) {
            console.warn("⚠ CSS não encontrado:", cssPath);
            return;
        }
        const cssContent = fs.readFileSync(cssPath, "utf8");
        mainWindow.webContents
            .executeJavaScript(`
        (function() {
          const style = document.createElement('style');
          style.textContent = \`${cssContent.replace(/`/g, '\\`')}\`;
          document.head.appendChild(style);
          console.log('[CSS] Injetado: ${path.basename(cssPath)}');
        })();
      `)
            .catch((err) => console.error("✗ Erro ao injetar CSS:", path.basename(cssPath), err));
    };
    // Função para buscar todos os arquivos recursivamente
    const getAllFiles = (dirPath, extension, arrayOfFiles = []) => {
        if (!fs.existsSync(dirPath))
            return arrayOfFiles;
        const files = fs.readdirSync(dirPath);
        files.forEach((file) => {
            const filePath = path.join(dirPath, file);
            if (fs.statSync(filePath).isDirectory()) {
                arrayOfFiles = getAllFiles(filePath, extension, arrayOfFiles);
            }
            else if (file.endsWith(extension)) {
                arrayOfFiles.push(filePath);
            }
        });
        return arrayOfFiles;
    };
    // Função para injetar JavaScript
    const injectFolder = (dir) => {
        const scripts = getAllFiles(dir, ".js");
        scripts.forEach((scriptPath) => {
            const code = fs.readFileSync(scriptPath, "utf8");
            mainWindow.webContents
                .executeJavaScript(code)
                .then(() => console.log("✓ Script injetado:", path.basename(scriptPath)))
                .catch((err) => console.error("✗ Erro ao injetar:", path.basename(scriptPath), err));
        });
    };
    // Aguardar o DOM estar pronto antes de injetar
    mainWindow.webContents.executeJavaScript(`
    new Promise((resolve) => {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', resolve);
      } else {
        resolve();
      }
    });
  `).then(() => {
        // 1. Injetar todos os CSS primeiro
        const cssFiles = getAllFiles(cssDir, ".css");
        cssFiles.forEach(injectCSS);
        // 2. Depois injetar os scripts
        injectFolder(sharedDir);
        injectFolder(gameDir);
        console.log("✅ Injeção completa para:", folder);
    });
    mainWindow.webContents.on("did-finish-load", () => {
        const win = mainWindow;
        if (!win)
            return;
        const currentUrl = win.webContents.getURL();
        console.log(`[Launcher] Página carregada: ${currentUrl}`);
        const scripts = getUiScripts();
        if (scripts.length === 0) {
            console.log("[Launcher] Nenhum script encontrado!");
            return;
        }
        console.log(`[Launcher] Injetando ${scripts.length} scripts...`);
        for (const scriptPath of scripts) {
            try {
                const scriptCode = fs.readFileSync(scriptPath, "utf8");
                win.webContents.executeJavaScript(scriptCode);
                const relative = path.relative(path.join(__dirname, "ui"), scriptPath);
                console.log(`[Launcher] [OK] ${relative}`);
            }
            catch (error) {
                console.error(`[Launcher] ERRO ao injetar ${path.basename(scriptPath)}`, error);
            }
        }
        console.log("[Launcher] Injeção de scripts concluída.");
    });
}
// IPC Handler para recarregar com novas configurações
electron_1.ipcMain.handle("apply-performance-settings", async (_event, settings) => {
    if (!mainWindow)
        return { success: false, error: "Window not found" };
    try {
        console.log("[IPC] Recebendo configurações de performance:", settings);
        // Aplicar configurações que não requerem restart
        applyPerformanceToWindow(settings);
        // Recarregar a página para aplicar mudanças
        mainWindow.reload();
        return { success: true };
    }
    catch (error) {
        console.error("[IPC] Erro ao aplicar configurações:", error);
        return { success: false, error: String(error) };
    }
});
// Aplicar flags do Chromium na inicialização do app (antes de criar janelas)
electron_1.app.on("ready", () => {
    // Flags que devem ser aplicadas no startup
    electron_1.app.commandLine.appendSwitch("disable-frame-rate-limit");
    electron_1.app.commandLine.appendSwitch("disable-gpu-vsync");
    electron_1.app.commandLine.appendSwitch("enable-gpu-rasterization");
    electron_1.app.commandLine.appendSwitch("enable-zero-copy");
    electron_1.app.commandLine.appendSwitch("ignore-gpu-blocklist");
    console.log("[Startup] Flags de performance aplicadas");
});
function getMime(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes = {
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
function getUiScripts() {
    const isDev = !electron_1.app.isPackaged;
    const uiScripts = path.join(__dirname, "ui");
    console.log(`[Launcher] isDev: ${isDev}`);
    console.log(`[Launcher] __dirname: ${__dirname}`);
    console.log(`[Launcher] uiScripts: ${uiScripts}`);
    const allScripts = [];
    const getScriptsRecursive = (dir) => {
        if (!fs.existsSync(dir)) {
            console.log(`[Launcher] Diretório não existe: ${dir}`);
            return [];
        }
        return fs.readdirSync(dir).flatMap((file) => {
            const full = path.join(dir, file);
            const stat = fs.statSync(full);
            if (stat.isDirectory())
                return getScriptsRecursive(full);
            return full.endsWith(".js") ? [full] : [];
        });
    };
    if (fs.existsSync(uiScripts)) {
        allScripts.push(...getScriptsRecursive(uiScripts));
    }
    console.log(`[Launcher] Total de scripts encontrados: ${allScripts.length}`);
    return allScripts;
}
electron_1.app.whenReady().then(() => {
    const mainWindow = createWindow();
    electron_1.protocol.handle("app", async (request) => {
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
        }
        catch (err) {
            console.error("[Launcher] Erro ao carregar recurso:", err);
            return new Response("Internal error", { status: 500 });
        }
    });
});
electron_2.autoUpdater.on("update-available", () => {
    console.log("Nova atualização disponível!");
});
electron_2.autoUpdater.on("update-downloaded", () => {
    electron_1.dialog
        .showMessageBox({
        type: "info",
        title: "Atualização pronta",
        message: "Uma nova versão foi baixada. O app será reiniciado para instalar a atualização.",
        buttons: ["Reiniciar agora"],
    })
        .then(() => {
        electron_2.autoUpdater.quitAndInstall();
    });
});
electron_1.app.on("window-all-closed", () => {
    if (process.platform !== "darwin")
        electron_1.app.quit();
});
