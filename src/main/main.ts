import { app, BrowserWindow, BrowserView, ipcMain, shell } from "electron";
import * as url from "url";
import { autoUpdater } from "electron-updater";
import * as path from "path";
import { GameType, LauncherConfig } from "../types";
import { ConfigManager } from "./config-manager";
import { GameManager } from "./game-manager";

class GameLauncher {
  private mainWindow: BrowserWindow | null = null;
  private gameView: BrowserView | null = null;
  private configManager: ConfigManager;
  private gameManager: GameManager;

  constructor() {
    this.configManager = new ConfigManager();
    this.gameManager = new GameManager();
    this.initializeApp();
  }

  private initializeApp(): void {
    // Configurar auto-updater
    this.setupAutoUpdater();

    // Eventos do app
    app.on("ready", () => this.onReady());
    app.on("window-all-closed", () => this.onWindowAllClosed());
    app.on("activate", () => this.onActivate());

    // IPC Handlers
    this.setupIpcHandlers();
  }

  private async onReady(): Promise<void> {
    await this.createMainWindow();

    // Verificar atualizações após 3 segundos
    setTimeout(() => {
      if (process.env.NODE_ENV !== "development") {
        autoUpdater.checkForUpdatesAndNotify();
      }
    }, 3000);
  }

  private onWindowAllClosed(): void {
    if (process.platform !== "darwin") {
      app.quit();
    }
  }

  private onActivate(): void {
    if (this.mainWindow === null) {
      this.createMainWindow();
    }
  }

  private async createMainWindow(): Promise<void> {
    this.mainWindow = new BrowserWindow({
      width: 1200,
      height: 800,
      minWidth: 900,
      minHeight: 600,
      backgroundColor: "#1a1a1a",
      show: false,
      webPreferences: {
        preload: path.join(__dirname, "../preload/preload.js"),
        contextIsolation: true,
        nodeIntegration: false,
        sandbox: true,
        webSecurity: true,
        allowRunningInsecureContent: false,
      },
      autoHideMenuBar: true,
      titleBarStyle: "default",
      icon: path.join(__dirname, "../../assets/icon.png"),
    });

    // Carregar página inicial
    const indexPath = path.join(__dirname, "../renderer/index.html");

    try {
      // Usar loadURL com pathToFileURL é mais robusto para caminhos no Windows
      await this.mainWindow.loadURL(url.pathToFileURL(indexPath).toString());
    } catch (error) {
      console.error("❌ Erro ao carregar index.html:", error);
      console.error("Caminho de carregamento:", indexPath);
    }

    // Mostrar janela quando estiver pronta
    this.mainWindow.once("ready-to-show", () => {
      this.mainWindow?.show();
      console.log("✅ Janela principal exibida com sucesso.");

      // Abrir DevTools em modo de desenvolvimento
      if (process.env.NODE_ENV === "development") {
        this.mainWindow?.webContents.openDevTools();
      }
    });

    this.mainWindow.webContents.on(
      "did-fail-load",
      (_event, errorCode, errorDescription, validatedURL) => {
        console.error(`❌ Falha ao carregar URL: ${validatedURL}`);
        console.error(`Código de Erro: ${errorCode}`);
        console.error(`Descrição do Erro: ${errorDescription}`);
        // Se o erro for o index.html, podemos tentar recarregar ou exibir uma mensagem
        if (validatedURL.includes("index.html")) {
          console.error("Tentativa de recarregar a página...");
          // Opcional: this.mainWindow?.reload();
        }
      }
    );

    // Prevenir navegação externa
    this.mainWindow.webContents.on("will-navigate", (event, _url) => {
      event.preventDefault();
    });

    // Abrir links externos no navegador padrão
    this.mainWindow.webContents.setWindowOpenHandler(({ url }) => {
      shell.openExternal(url);
      return { action: "deny" };
    });

    this.mainWindow.on("closed", () => {
      this.mainWindow = null;
      if (this.gameView) {
        this.gameView.webContents.close();
        this.gameView = null;
      }
    });
  }

  private setupAutoUpdater(): void {
    autoUpdater.autoDownload = true;
    autoUpdater.autoInstallOnAppQuit = true;

    autoUpdater.on("update-available", (info) => {
      console.log("Atualização disponível:", info);
      this.mainWindow?.webContents.send("update-available", info);
    });

    autoUpdater.on("update-downloaded", (info) => {
      console.log("Atualização baixada:", info);
      this.mainWindow?.webContents.send("update-downloaded", info);
    });

    autoUpdater.on("error", (error) => {
      console.error("Erro no auto-updater:", error);
      this.mainWindow?.webContents.send("update-error", error);
    });
  }

  private setupIpcHandlers(): void {
    // Lançar jogo
    ipcMain.handle("launch-game", async (_event, gameType: GameType) => {
      try {
        await this.launchGame(gameType);
        return { success: true };
      } catch (error) {
        console.error("Erro ao lançar jogo:", error);
        return { success: false, error: (error as Error).message };
      }
    });

    // Fechar jogo
    ipcMain.handle("close-game", async () => {
      try {
        this.closeGame();
        return { success: true };
      } catch (error) {
        console.error("Erro ao fechar jogo:", error);
        return { success: false, error: (error as Error).message };
      }
    });

    // Trocar jogo
    ipcMain.handle("switch-game", async (_event, gameType: GameType) => {
      try {
        this.closeGame();
        await this.launchGame(gameType);
        return { success: true };
      } catch (error) {
        console.error("Erro ao trocar jogo:", error);
        return { success: false, error: (error as Error).message };
      }
    });

    // Obter configuração
    ipcMain.handle("get-config", async () => {
      return this.configManager.getConfig();
    });

    // Definir configuração
    ipcMain.handle(
      "set-config",
      async (_event, config: Partial<LauncherConfig>) => {
        this.configManager.setConfig(config);
        return { success: true };
      }
    );

    // Verificar atualizações
    ipcMain.handle("check-updates", async () => {
      if (process.env.NODE_ENV !== "development") {
        await autoUpdater.checkForUpdates();
      }
      return { success: true };
    });

    // Sair do app
    ipcMain.on("quit-app", () => {
      app.quit();
    });

    // Toggle modal (do injector)
    ipcMain.on("toggle-modal", async (_event, data) => {
      console.log("Toggle modal:", data);

      // Processar ações do modal
      if (data.action === "close-game") {
        this.closeGame();
      } else if (data.action === "switch-game" && data.game) {
        this.closeGame();
        await this.launchGame(data.game as GameType);
      }
    });
  }

  private async launchGame(gameType: GameType): Promise<void> {
    if (!this.mainWindow) {
      throw new Error("Janela principal não existe");
    }

    const gameConfig = this.gameManager.getGameConfig(gameType);

    // Criar BrowserView para o jogo
    this.gameView = new BrowserView({
      webPreferences: {
        preload: path.join(__dirname, "../preload/injector-preload.js"),
        contextIsolation: true,
        nodeIntegration: false,
        sandbox: true,
        webSecurity: true,
      },
    });

    this.mainWindow.setBrowserView(this.gameView);

    // Definir bounds do BrowserView (tela inteira)
    const bounds = this.mainWindow.getContentBounds();
    this.gameView.setBounds({
      x: 0,
      y: 0,
      width: bounds.width,
      height: bounds.height,
    });

    // Ajustar bounds quando a janela for redimensionada
    this.mainWindow.on("resize", () => {
      if (this.gameView && this.mainWindow) {
        const newBounds = this.mainWindow.getContentBounds();
        this.gameView.setBounds({
          x: 0,
          y: 0,
          width: newBounds.width,
          height: newBounds.height,
        });
      }
    });

    // Carregar jogo
    await this.gameView.webContents.loadURL(gameConfig.url);

    // Bloquear navegação para URLs não autorizadas (segurança)
    this.gameView.webContents.on("will-navigate", (event, url) => {
      // Permitir apenas a URL do jogo e subdomínios
      if (!url.startsWith(gameConfig.url)) {
        console.warn(`❌ Navegação bloqueada: ${url}`);
        event.preventDefault();
        // Abrir links externos no navegador padrão, se necessário
        shell.openExternal(url);
      }
    });

    // Atualizar configuração
    this.configManager.setConfig({ currentGame: gameType });
  }

  private closeGame(): void {
    if (this.gameView) {
      this.mainWindow?.removeBrowserView(this.gameView);
      this.gameView.webContents.close();
      this.gameView = null;
    }

    this.configManager.setConfig({ currentGame: null });
  }
}

// Inicializar aplicação
new GameLauncher();
