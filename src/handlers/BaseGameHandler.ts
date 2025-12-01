import { BrowserWindow, app } from "electron";
import * as fs from "fs";
import * as path from "path";

const isDev = require("electron-is-dev");

export interface GameConfig {
  enableFPSControl?: boolean;
  unlimitedFPS?: boolean;
  fpsLimit?: number | null;
  customScriptsPath?: string;
  webPreferences?: any;
}

export abstract class BaseGameHandler {
  protected window: BrowserWindow | null = null;
  protected config: GameConfig;
  protected configPath: string;
  protected gameScriptsPath: string;
  protected sharedScriptsPath: string;

  constructor(
    protected gameId: string,
    protected gameUrl: string,
    protected scriptsBasePath: string
  ) {
    const gameIdLower = gameId.toLowerCase();
    
    const configDir = isDev
        ? path.join(app.getAppPath(), 'src', 'configs') 
        : path.join(process.resourcesPath, 'configs');
        
    this.configPath = path.join(configDir, `${gameIdLower}-config.json`);

    this.gameScriptsPath = path.join(scriptsBasePath, gameIdLower);
    this.sharedScriptsPath = path.join(scriptsBasePath, 'shared');

    this.config = this.loadConfig();
    
    console.log(`[${this.gameId}] Caminho dos scripts do jogo: ${this.gameScriptsPath}`);
    console.log(`[${this.gameId}] Caminho dos scripts compartilhados: ${this.sharedScriptsPath}`);
  }

  protected loadConfig(): GameConfig {
    try {
      if (fs.existsSync(this.configPath)) {
        const data = fs.readFileSync(this.configPath, 'utf8');
        const config = JSON.parse(data);
        console.log(`[${this.gameId}] Configuração carregada de ${this.configPath}:`, config);
        return { ...this.getDefaultConfig(), ...config };
      }
    } catch (error) {
      console.error(`[${this.gameId}] Erro ao carregar config:`, error);
    }
    
    console.log(`[${this.gameId}] Usando configuração padrão`);
    return this.getDefaultConfig();
  }

  protected saveConfig(config: GameConfig): void {
    try {
      const dir = path.dirname(this.configPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(this.configPath, JSON.stringify(config, null, 2), 'utf8');
      console.log(`[${this.gameId}] ✅ Configuração salva em ${this.configPath}:`, config);
    } catch (error) {
      console.error(`[${this.gameId}] ❌ Erro ao salvar config:`, error);
    }
  }

  abstract getDefaultConfig(): GameConfig;
  abstract applyCommandLineFlags(): void;
  abstract onPageLoad(window: BrowserWindow): void;

  getScripts(): string[] {
    const allScripts: string[] = [];

    console.log(`[${this.gameId}] Lendo scripts compartilhados de: ${this.sharedScriptsPath}`);
    allScripts.push(...this.getScriptsRecursive(this.sharedScriptsPath));

    console.log(`[${this.gameId}] Lendo scripts específicos de: ${this.gameScriptsPath}`);
    allScripts.push(...this.getScriptsRecursive(this.gameScriptsPath));

    console.log(`[${this.gameId}] Total de ${allScripts.length} arquivos de script encontrados.`);
    return allScripts;
  }

  getScriptsRecursive(dir: string): string[] {
    if (!fs.existsSync(dir)) {
      console.warn(`[${this.gameId}] Diretório de scripts não encontrado:`, dir);
      return [];
    }

    let results: string[] = [];
    const list = fs.readdirSync(dir);

    list.forEach((file) => {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat && stat.isDirectory()) {
            results = results.concat(this.getScriptsRecursive(fullPath));
        } else if (fullPath.endsWith('.js')) {
            results.push(fullPath);
        }
    });

    return results;
  }

  injectScripts(window: BrowserWindow): void {
    const scripts = this.getScripts();
    
    if (scripts.length === 0) {
      console.log(`[${this.gameId}] Nenhum script para injetar.`);
      return;
    }

    console.log(`[${this.gameId}] Preparando para injetar ${scripts.length} scripts...`);

    setTimeout(() => {
      console.log(`[${this.gameId}] Iniciando injeção de scripts.`);
      for (const scriptPath of scripts) {
        try {
          const scriptCode = fs.readFileSync(scriptPath, "utf8");
          window.webContents.executeJavaScript(scriptCode);
          
          const relativePath = path.relative(this.scriptsBasePath, scriptPath);
          console.log(`[${this.gameId}] [INJETADO] ${relativePath}`);
        } catch (error) {
          console.error(
            `[${this.gameId}] [ERRO] Falha ao injetar ${path.basename(scriptPath)}:`,
            error
          );
        }
      }
      console.log(`[${this.gameId}] Injeção de todos os scripts concluída.`);
    }, 1500);
  }

  getConfig(): GameConfig {
    return this.config;
  }

  updateConfig(newConfig: Partial<GameConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.saveConfig(this.config);
  }

  setWindow(window: BrowserWindow): void {
    this.window = window;
  }

  getGameUrl(): string {
    return this.gameUrl;
  }
}
