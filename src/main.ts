import { app, BrowserWindow, Menu, protocol, ipcMain } from "electron";
import * as path from "path";
import * as fs from "fs";
import { GameUrls, GameType } from "./types/games.types";
require("dotenv").config();

function detectGameType(url: string): GameType | null {
  if (url.includes("haxball.com")) return GameType.HAXBALL;
  if (url.includes("bonk.io")) return GameType.BONKIO;
  return null;
}

function getGameScripts(gameType: GameType | null): string[] {
  const scriptsDir = path.join(__dirname, "scripts");
  
  const sharedScripts = path.join(scriptsDir, "shared");
  
  let gameSpecificDir: string | null = null;
  
  if (gameType === GameType.HAXBALL) {
    gameSpecificDir = path.join(scriptsDir, "haxball");
  } else if (gameType === GameType.BONKIO) {
    gameSpecificDir = path.join(scriptsDir, "bonk");
  }
  
  const allScripts: string[] = [];
  
  const getScriptsRecursive = (dir: string): string[] => {
    if (!fs.existsSync(dir)) return [];
    
    return fs.readdirSync(dir).flatMap((file) => {
      const full = path.join(dir, file);
      const stat = fs.statSync(full);
      
      if (stat.isDirectory()) {
        return getScriptsRecursive(full);
      }
      
      return full.endsWith(".js") ? [full] : [];
    });
  };
  
  if (fs.existsSync(sharedScripts)) {
    allScripts.push(...getScriptsRecursive(sharedScripts));
  }
  
  if (gameSpecificDir && fs.existsSync(gameSpecificDir)) {
    allScripts.push(...getScriptsRecursive(gameSpecificDir));
  }
  
  return allScripts;
}

let currentGameUrl = GameUrls[GameType.BONKIO];

function createWindow() {
  const isDev = !app.isPackaged;
  const iconPath = isDev
    ? path.join(__dirname, "../assets/images/icon.ico")
    : path.join(process.resourcesPath, "assets", "images", "icon.ico");

  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: iconPath,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      sandbox: false,
      nodeIntegration: false,
      webSecurity: false,
      devTools: true,
    },
  });

  mainWindow.loadURL(currentGameUrl);

  if (app.isPackaged) {
    Menu.setApplicationMenu(null);
  }

  mainWindow.on("page-title-updated", (event) => {
    event.preventDefault();
    mainWindow.setTitle("Futhero Launcher");
  });

  mainWindow.webContents.on("did-finish-load", () => {
    const currentUrl = mainWindow.webContents.getURL();
    const gameType = detectGameType(currentUrl);
    
    console.log(`[Launcher] Pagina carregada: ${currentUrl}`);
    console.log(`[Launcher] Jogo detectado: ${gameType || "Desconhecido"}`);
    
    const scriptsDir = path.join(__dirname, "scripts");
    console.log(`[Launcher] Diretorio de scripts: ${scriptsDir}`);
    console.log(`[Launcher] Existe? ${fs.existsSync(scriptsDir)}`);
    
    const scripts = getGameScripts(gameType);
    
    if (scripts.length === 0) {
      console.log("[Launcher] AVISO: Nenhum script encontrado!");
      console.log("[Launcher] Verifique a estrutura de pastas:");
      console.log(`[Launcher] - ${scriptsDir}/shared/ui/`);
      console.log(`[Launcher] - ${scriptsDir}/bonk/`);
      console.log(`[Launcher] - ${scriptsDir}/haxball/`);
      return;
    }
    
    console.log(`[Launcher] Injetando ${scripts.length} scripts...`);
    
    for (const scriptPath of scripts) {
      try {
        const scriptCode = fs.readFileSync(scriptPath, "utf8");
        mainWindow.webContents.executeJavaScript(scriptCode);
        
        const relativePath = path.relative(path.join(__dirname, "scripts"), scriptPath);
        console.log(`[Launcher] [OK] ${relativePath}`);
      } catch (error) {
        console.error(`[Launcher] [ERRO] Falha ao injetar ${path.basename(scriptPath)}:`, error);
      }
    }
    
    console.log("[Launcher] Injecao de scripts concluida.");
  });

  mainWindow.webContents.setWindowOpenHandler(() => ({ action: "deny" }));
  
  mainWindow.webContents.on("did-navigate", (event, url) => {
    const newGameType = detectGameType(url);
    console.log(`[Launcher] Navegacao detectada: ${url}`);
    console.log(`[Launcher] Novo jogo: ${newGameType || "Desconhecido"}`);
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
  protocol.handle("app", async (request) => {
    const url = request.url.replace("app://", "");
    const filePath = path.join(__dirname, url);

    try {
      const fileContent = await fs.promises.readFile(filePath);
      return new Response(fileContent, {
        headers: {
          "content-type": getMime(filePath),
        },
      });
    } catch (error) {
      console.error(`[Launcher] Erro ao carregar recurso: ${filePath}`, error);
      return new Response("File not found", { status: 404 });
    }
  });

  const mainWindow = createWindow();

  ipcMain.on("switch-game", (event, gameType: GameType) => {
    console.log(`[Launcher] Trocando para: ${gameType}`);
    currentGameUrl = GameUrls[gameType];
    mainWindow.loadURL(currentGameUrl);
  });

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});