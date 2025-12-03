import { BrowserWindow, app } from "electron";
import { BaseGameHandler, GameConfig } from "./BaseGameHandler";

export class BonkHandler extends BaseGameHandler {
  constructor(scriptsBasePath: string) {
    super("BONKIO", "https://bonk.io", scriptsBasePath);
  }

  getDefaultConfig(): GameConfig {
    return {
      enableFPSControl: true,
      unlimitedFPS: false,
      fpsLimit: null,
      customScriptsPath: "bonk",
      webPreferences: {
        webSecurity: false,
        allowRunningInsecureContent: true,
      }
    };
  }

  applyCommandLineFlags(): void {
    if (this.config.unlimitedFPS) {
      console.log('[BONKIO] ⚡ Aplicando flags de FPS ilimitado...');
      app.commandLine.appendSwitch("disable-frame-rate-limit");
      app.commandLine.appendSwitch("disable-gpu-vsync");
    } else {
      console.log('[BONKIO] ✅ Modo FPS padrão/limitado - Sem flags adicionais');
    }
  }

  onPageLoad(window: BrowserWindow): void {
    console.log("[BONKIO] Página carregada, aplicando customizações e injeção de scripts...");

    window.webContents.executeJavaScript(`
      (function() {
        console.log("[BonkFix] Aplicando fixes de UI...");
        const waitForCanvas = setInterval(() => {
          const canvas = document.getElementById("gamecanvas") || document.getElementById("gameframe") || document.querySelector("canvas");
          if (canvas) {
            clearInterval(waitForCanvas);
            canvas.style.width = "100%";
            canvas.style.height = "100%";
            window.dispatchEvent(new Event("resize"));
          }
        }, 100);
      })();
    `);

    if (this.config.unlimitedFPS) {
      console.log("[BONKIO] 🚀 Configurando FPS ilimitado via webContents...");
      window.webContents.setFrameRate(0);
    } else if (this.config.fpsLimit) {
      console.log(`[BONKIO] 🎯 Configurando FPS limitado: ${this.config.fpsLimit}`);
    } else {
      console.log("[BONKIO] ✅ Usando FPS padrão do jogo");
      window.webContents.setFrameRate(60);
    }

    this.injectScripts(window);
  }

  async toggleUnlimitedFPS(): Promise<boolean> {
    if (!this.config.enableFPSControl) {
      console.log("[BONKIO] FPS control está desabilitado");
      return false;
    }

    const oldUnlimited = this.config.unlimitedFPS;
    const newValue = !oldUnlimited;

    this.updateConfig({ 
      unlimitedFPS: newValue,
      fpsLimit: newValue ? null : (this.config.fpsLimit || null)
    });
    
    console.log(`[BONKIO FPS] Estado alterado: ${newValue ? 'DESBLOQUEADO' : 'BLOQUEADO'}`);
    console.log(`[BONKIO FPS] Config atual:`, this.config);

    return true;
  }

  async setFpsLimit(limit: number | null): Promise<boolean> {
    if (!this.config.enableFPSControl) {
      console.log("[BONKIO] FPS control está desabilitado");
      return false;
    }

    if (limit !== null && (typeof limit !== 'number' || limit < 30 || limit > 1000)) {
      console.error('[BONKIO FPS] Limite inválido:', limit);
      return false;
    }

    const oldLimit = this.config.fpsLimit;
    const oldUnlimited = this.config.unlimitedFPS;

    const newUnlimitedState = false;

    this.updateConfig({
      fpsLimit: limit,
      unlimitedFPS: newUnlimitedState
    });

    console.log(`[BONKIO FPS] Limite definido: ${limit ?? 'padrão (nativo)'}`);
    console.log(`[BONKIO FPS] Config atual:`, this.config);

    return oldUnlimited !== newUnlimitedState;
  }

  getFpsLimit(): number | null {
    return this.config.fpsLimit || null;
  }

  isUnlockedFps(): boolean {
    return this.config.unlimitedFPS || false;
  }

  getFpsConfig(): { unlimitedFPS: boolean; fpsLimit: number | null; isDefault: boolean } {
    const unlimitedFPS = this.config.unlimitedFPS || false;
    const fpsLimit = this.config.fpsLimit || null;
    const isDefault = !unlimitedFPS && fpsLimit === null;
    
    return {
      unlimitedFPS,
      fpsLimit,
      isDefault
    };
  }
}