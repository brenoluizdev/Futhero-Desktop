import * as electron from 'electron';
const { app, BrowserWindow, Menu } = electron;
import * as path from 'path';
import { GameUrls, GameType } from './types/games.types';
require('dotenv').config();

const GAME_URL = GameUrls[GameType.BONKIO];

function createWindow() {
    const isDev = !app.isPackaged;
    const iconPath = isDev
        ? path.join(__dirname, '../assets/images/icon.ico')
        : path.join(process.resourcesPath, 'assets', 'images', 'icon.ico');

    const mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        icon: iconPath,
        webPreferences: {
            contextIsolation: true,
            sandbox: true,
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            webSecurity: true,
            devTools: false,
        },
    });

    mainWindow.loadURL(GAME_URL);

    Menu.setApplicationMenu(null);

    mainWindow.webContents.on('devtools-opened', () => {
        mainWindow.webContents.closeDevTools();
    });

    mainWindow.webContents.setWindowOpenHandler(() => {
        return { action: 'deny' };
    });

    // if (process.env.NODE_ENV === 'development') mainWindow.webContents.openDevTools();
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
