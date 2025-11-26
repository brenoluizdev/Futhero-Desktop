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
    const injectFolder = (dir) => {
        if (!fs.existsSync(dir))
            return;
        const scripts = fs.readdirSync(dir).filter(f => f.endsWith(".js"));
        scripts.forEach(script => {
            const scriptPath = path.join(dir, script);
            const code = fs.readFileSync(scriptPath, "utf8");
            mainWindow.webContents.executeJavaScript(code)
                .catch(err => console.error("Erro ao injetar script:", script, err));
        });
    };
    injectFolder(sharedDir);
    injectFolder(gameDir);
    console.log("Scripts injetados para:", folder);
}
electron_1.app.whenReady().then(() => {
    createWindow();
});
electron_1.app.on("window-all-closed", () => {
    if (process.platform !== "darwin")
        electron_1.app.quit();
});
