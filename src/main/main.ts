import { app, BrowserWindow } from "electron";
import * as path from "path";
import * as fs from "fs";

const isDev = !app.isPackaged;

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    resizable: true,
    autoHideMenuBar: true,
    icon: path.join(__dirname, "../assets/icon.ico"),
    webPreferences: {
      preload: path.join(__dirname, "../preload/preload.js"),
      nodeIntegration: false,
      contextIsolation: false,
      webSecurity: false,
      allowRunningInsecureContent: true,
      devTools: isDev,
    },
  });

  mainWindow.on("page-title-updated", (event) => event.preventDefault());

  mainWindow.setTitle("Futhero Launcher");

  mainWindow.loadFile(path.join(__dirname, "../renderer/index.html"));

  mainWindow.webContents.on("did-navigate", async (_event, url) => {
    injectScriptsForURL(url);
  });
}

function injectScriptsForURL(url: string) {
  if (!mainWindow) return;

  let folder = "";

  if (url.includes("bonk.io")) folder = "bonk";
  else if (url.includes("haxball.com")) folder = "haxball";
  else return;

  const sharedDir = path.join(__dirname, "../scripts/shared");
  const gameDir   = path.join(__dirname, `../scripts/${folder}`);

  const injectFolder = (dir: string) => {
    if (!fs.existsSync(dir)) return;

    const scripts = fs.readdirSync(dir).filter(f => f.endsWith(".js"));

    scripts.forEach(script => {
      const scriptPath = path.join(dir, script);
      const code = fs.readFileSync(scriptPath, "utf8");

      mainWindow!.webContents.executeJavaScript(code)
        .catch(err => console.error("Erro ao injetar script:", script, err));
    });
  };

  injectFolder(sharedDir);
  injectFolder(gameDir);

  console.log("Scripts injetados para:", folder);
}

app.whenReady().then(() => {
  createWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
