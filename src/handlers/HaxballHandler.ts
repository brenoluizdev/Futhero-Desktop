import { BrowserWindow } from "electron";
import { BaseGameHandler, GameConfig } from "./BaseGameHandler";

export class HaxballHandler extends BaseGameHandler {
  constructor(scriptsBasePath: string) {
    super("HAXBALL", "https://www.haxball.com/play", scriptsBasePath );
  }

  getDefaultConfig(): GameConfig {
    return {
      enableFPSControl: false,
      customScriptsPath: "haxball",
      webPreferences: {
        webSecurity: false,
        allowRunningInsecureContent: true,
        csp: '', 
      }
    };
  }

  applyCommandLineFlags(): void {
    console.log('[HAXBALL] Configuração de WebRTC aplicada.');
  }

  onPageLoad(window: BrowserWindow): void {
    console.log("[HAXBALL] Página carregada, aplicando customizações...");
    this.injectScripts(window);
  }
}
