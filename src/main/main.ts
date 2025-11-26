import { app, BrowserWindow, ipcMain, protocol, dialog } from "electron";
import * as path from "path";
import * as fs from "fs";
import { autoUpdater } from "electron";

const isDev = !app.isPackaged;

let mainWindow: BrowserWindow | null = null;

// Interface para as configurações de performance
interface PerformanceSettings {
  unlockFPS: boolean;
  hardwareAccel: boolean;
  lowLatency: boolean;
  disableAnimations: boolean;
  prioritizePerformance: boolean;
}

function createWindow() {
  mainWindow = new BrowserWindow({
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
function applyPerformanceToWindow(settings: PerformanceSettings) {
  if (!mainWindow) return;

  console.log("[Performance] Aplicando configurações:", settings);

  // Unlock FPS - desabilitar limitador de FPS do Chromium
  if (settings.unlockFPS) {
    mainWindow.webContents.setFrameRate(0); // 0 = sem limite
    console.log("[Performance] ✓ FPS desbloqueado");
  } else {
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

function injectScriptsForURL(url: string) {
  if (!mainWindow) return;

  let folder = "";

  if (url.includes("bonk.io")) folder = "bonk";
  else if (url.includes("haxball.com")) folder = "haxball";
  else return;

  const sharedDir = path.join(__dirname, "../scripts/shared");
  const gameDir = path.join(__dirname, `../scripts/${folder}`);
  const cssDir = path.join(__dirname, "../css");

  // Função para injetar CSS
  const injectCSS = (cssPath: string) => {
    if (!fs.existsSync(cssPath)) {
      console.warn("⚠ CSS não encontrado:", cssPath);
      return;
    }

    const cssContent = fs.readFileSync(cssPath, "utf8");
    
    mainWindow!.webContents
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
  const getAllFiles = (dirPath: string, extension: string, arrayOfFiles: string[] = []) => {
    if (!fs.existsSync(dirPath)) return arrayOfFiles;

    const files = fs.readdirSync(dirPath);

    files.forEach((file) => {
      const filePath = path.join(dirPath, file);
      if (fs.statSync(filePath).isDirectory()) {
        arrayOfFiles = getAllFiles(filePath, extension, arrayOfFiles);
      } else if (file.endsWith(extension)) {
        arrayOfFiles.push(filePath);
      }
    });

    return arrayOfFiles;
  };

  // Função para injetar JavaScript
  const injectFolder = (dir: string) => {
    const scripts = getAllFiles(dir, ".js");

    scripts.forEach((scriptPath) => {
      const code = fs.readFileSync(scriptPath, "utf8");

      mainWindow!.webContents
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
    if (!win) return;

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

        const relative = path.relative(
          path.join(__dirname, "ui"),
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
  });
}

// IPC Handler para recarregar com novas configurações
ipcMain.handle("apply-performance-settings", async (_event, settings: PerformanceSettings) => {
  if (!mainWindow) return { success: false, error: "Window not found" };

  try {
    console.log("[IPC] Recebendo configurações de performance:", settings);
    
    // Aplicar configurações que não requerem restart
    applyPerformanceToWindow(settings);
    
    // Recarregar a página para aplicar mudanças
    mainWindow.reload();
    
    return { success: true };
  } catch (error) {
    console.error("[IPC] Erro ao aplicar configurações:", error);
    return { success: false, error: String(error) };
  }
});

// Aplicar flags do Chromium na inicialização do app (antes de criar janelas)
app.on("ready", () => {
  // Flags que devem ser aplicadas no startup
  app.commandLine.appendSwitch("disable-frame-rate-limit");
  app.commandLine.appendSwitch("disable-gpu-vsync");
  app.commandLine.appendSwitch("enable-gpu-rasterization");
  app.commandLine.appendSwitch("enable-zero-copy");
  app.commandLine.appendSwitch("ignore-gpu-blocklist");
  
  console.log("[Startup] Flags de performance aplicadas");
});

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

function getUiScripts(): string[] {
  const isDev = !app.isPackaged;
  const uiScripts = path.join(__dirname, "ui");

  console.log(`[Launcher] isDev: ${isDev}`);
  console.log(`[Launcher] __dirname: ${__dirname}`);
  console.log(`[Launcher] uiScripts: ${uiScripts}`);

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

  if (fs.existsSync(uiScripts)) {
    allScripts.push(...getScriptsRecursive(uiScripts));
  }

  console.log(`[Launcher] Total de scripts encontrados: ${allScripts.length}`);
  return allScripts;
}

app.whenReady().then(() => {
   const mainWindow = createWindow();
   
   protocol.handle("app", async (request) => {
    try {
      const url = request.url.replace("app://", "");

      const filePath = path.join(__dirname, url);

      console.log(`[Launcher] Protocol handler - URL requisitada: ${url}`);
      console.log(
        `[Launcher] Protocol handler - Caminho resolvido: ${filePath}`
      );

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
});

autoUpdater.on("update-available", () => {
  console.log("Nova atualização disponível!");
});

autoUpdater.on("update-downloaded", () => {
  dialog
    .showMessageBox({
      type: "info",
      title: "Atualização pronta",
      message:
        "Uma nova versão foi baixada. O app será reiniciado para instalar a atualização.",
      buttons: ["Reiniciar agora"],
    })
    .then(() => {
      autoUpdater.quitAndInstall();
    });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});