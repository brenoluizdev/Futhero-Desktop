import { app } from "electron";
import * as path from "path";
import { BaseGameHandler } from "./BaseGameHandler";
import { BonkHandler } from "./BonkHandler";
import { HaxballHandler } from "./HaxballHandler";
import { GameType } from "../types/games.types";

const isDev = require("electron-is-dev");

export class GameManager {
  private handlers: Map<GameType, BaseGameHandler>;
  private currentHandler: BaseGameHandler | null = null;
  private scriptsBasePath: string;

  constructor() {
    if (isDev) {
      this.scriptsBasePath = path.join(app.getAppPath(), 'dist', 'scripts');
    } else {
      this.scriptsBasePath = path.join(process.resourcesPath, 'scripts');
    }

    console.log(`[GameManager] Caminho base dos scripts definido para: ${this.scriptsBasePath}`);

    this.handlers = new Map();
    this.initializeHandlers();
  }

  private initializeHandlers(): void {
    this.handlers.set(GameType.BONKIO, new BonkHandler(this.scriptsBasePath));
    this.handlers.set(GameType.HAXBALL, new HaxballHandler(this.scriptsBasePath));
    
    console.log('[GameManager] Handlers registrados:', Array.from(this.handlers.keys()));
  }

  getHandler(gameType: GameType): BaseGameHandler | null {
    const handler = this.handlers.get(gameType);
    
    if (!handler) {
      console.error(`[GameManager] Handler não encontrado para: ${gameType}`);
      return null;
    }
    
    this.currentHandler = handler;
    return handler;
  }

  getCurrentHandler(): BaseGameHandler | null {
    return this.currentHandler;
  }

  detectGameType(url: string): GameType | null {
    if (url.includes("haxball.com")) return GameType.HAXBALL;
    if (url.includes("bonk.io")) return GameType.BONKIO;
    return null;
  }

  applyCommandLineFlags(gameType: GameType): void {
    const handler = this.getHandler(gameType);
    if (handler) {
      handler.applyCommandLineFlags();
    }
  }

  applyInitialFlags(gameType?: GameType): void {
    if (!gameType) {
      console.log('[GameManager] Nenhum jogo especificado, usando configuração padrão');
      return;
    }

    console.log(`[GameManager] Aplicando flags iniciais para: ${gameType}`);
    this.applyCommandLineFlags(gameType);
  }

  getAllHandlers(): Map<GameType, BaseGameHandler> {
    return this.handlers;
  }
}
