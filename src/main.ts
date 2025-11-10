import { app, BrowserWindow, Menu } from "electron";
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
    const scriptFiles = fs
      .readdirSync(scriptsDir)
      .filter((file) => file.endsWith(".js") && file !== "index.js");

    for (const file of scriptFiles) {
      const scriptPath = path.join(scriptsDir, file);
      const scriptCode = fs.readFileSync(scriptPath, "utf8");
      mainWindow.webContents.executeJavaScript(scriptCode);
      console.log(`[Launcher] Injected script: ${file}`);
    }

    console.log("[Launcher] All frontend scripts injected successfully.");
  });

  mainWindow.webContents.setWindowOpenHandler(() => ({ action: "deny" }));
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
