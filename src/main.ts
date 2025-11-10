import { app, BrowserWindow, Menu, protocol } from "electron";
import * as path from "path";
import * as fs from "fs";
import { GameUrls, GameType } from "./types/games.types";
require("dotenv").config();

const GAME_URL = GameUrls[GameType.BONKIO];

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

  mainWindow.loadURL(GAME_URL);

  if (app.isPackaged) {
    Menu.setApplicationMenu(null);
  }

  mainWindow.on("page-title-updated", (event) => {
    event.preventDefault();
    mainWindow.setTitle("Futhero Launcher");
  });

  mainWindow.webContents.on("did-finish-load", () => {
    const scriptsDir = path.join(__dirname, "scripts");

    const getScriptsRecursive = (dir: string): string[] =>
      fs.readdirSync(dir).flatMap((file) => {
        const full = path.join(dir, file);
        return fs.statSync(full).isDirectory()
          ? getScriptsRecursive(full)
          : [full];
      });

    const scripts = getScriptsRecursive(scriptsDir).filter((f) =>
      f.endsWith(".js")
    );

    console.log(scripts);

    for (const scriptPath of scripts) {
      const scriptCode = fs.readFileSync(scriptPath, "utf8");
      mainWindow.webContents.executeJavaScript(scriptCode);

      console.log(`[Launcher] Injected script: ${path.basename(scriptPath)}`);
    }

    console.log("[Launcher] All frontend scripts injected successfully.");
  });

  mainWindow.webContents.setWindowOpenHandler(() => ({ action: "deny" }));
}

function getMime(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();

  switch (ext) {
    case ".css":
      return "text/css";
    case ".js":
      return "text/javascript";
    case ".json":
      return "application/json";
    case ".png":
      return "image/png";
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".svg":
      return "image/svg+xml";
    case ".html":
      return "text/html";
    default:
      return "application/octet-stream";
  }
}

app.whenReady().then(() => {
  protocol.handle("app", async (request) => {
    const url = request.url.replace("app://", "");
    const filePath = path.join(__dirname, url);

    return new Response(await fs.promises.readFile(filePath), {
      headers: {
        "content-type": getMime(filePath),
      },
    });
  });

  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
