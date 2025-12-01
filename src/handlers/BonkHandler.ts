import { app, BrowserWindow } from "electron";
import { BaseGameHandler, GameConfig } from "./BaseGameHandler";

export class BonkHandler extends BaseGameHandler {
  constructor(scriptsBasePath: string) {
    super("BONKIO", "https://bonk.io", scriptsBasePath );
  }

  getDefaultConfig(): GameConfig {
    return {
      enableFPSControl: true,
      unlimitedFPS: false,
      fpsLimit: null,
      customScriptsPath: "bonk"
    };
  }

  applyCommandLineFlags(): void {
    if (!this.config.enableFPSControl) {
      console.log("[BONKIO] FPS control desabilitado");
      return;
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('[BONKIO FPS] Configuração:');
    console.log(`[BONKIO FPS]   unlimitedFPS: ${this.config.unlimitedFPS}`);
    console.log(`[BONKIO FPS]   fpsLimit: ${this.config.fpsLimit}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    if (this.config.unlimitedFPS) {
      console.log("[BONKIO FPS] Aplicando flags de FPS ilimitado...");
      app.commandLine.appendSwitch("disable-frame-rate-limit");
      app.commandLine.appendSwitch("disable-gpu-vsync");
    } else if (this.config.fpsLimit && this.config.fpsLimit > 0) {
      console.log(`[BONKIO FPS] Limite de ${this.config.fpsLimit} FPS`);
      app.commandLine.appendSwitch("disable-frame-rate-limit");
      app.commandLine.appendSwitch("disable-gpu-vsync");
    } else {
      console.log("[BONKIO FPS] Modo padrão");
    }
  }

  onPageLoad(window: BrowserWindow): void {
    console.log("[BONKIO] Página carregada, aplicando customizações...");
    
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

    this.injectScripts(window);
  }

  async toggleUnlimitedFPS(): Promise<boolean> {
    if (!this.config.enableFPSControl) {
      console.log("[BONKIO] FPS control está desabilitado");
      return false;
    }

    const newValue = !this.config.unlimitedFPS;
    this.updateConfig({ 
      unlimitedFPS: newValue,
      fpsLimit: newValue ? null : this.config.fpsLimit
    });
    
    console.log(`[BONKIO FPS] Estado alterado: ${newValue ? 'DESBLOQUEADO' : 'BLOQUEADO'}`);
    return newValue;
  }

  async setFpsLimit(limit: number | null): Promise<number | null> {
    if (!this.config.enableFPSControl) {
      console.log("[BONKIO] FPS control está desabilitado");
      return null;
    }

    if (limit !== null && (typeof limit !== 'number' || limit < 0 || limit > 1000)) {
      console.error('[BONKIO FPS] Limite inválido:', limit);
      return this.config.fpsLimit || null;
    }

    this.updateConfig({
      fpsLimit: limit,
      unlimitedFPS: limit === null ? false : this.config.unlimitedFPS
    });

    console.log(`[BONKIO FPS] Limite definido: ${limit ?? 'nenhum'}`);
    return limit;
  }

  getFpsLimit(): number | null {
    return this.config.fpsLimit || null;
  }

  isUnlockedFps(): boolean {
    return this.config.unlimitedFPS || false;
  }

  getFpsConfig(): { unlimitedFPS: boolean; fpsLimit: number | null } {
    return {
      unlimitedFPS: this.config.unlimitedFPS || false,
      fpsLimit: this.config.fpsLimit || null
    };
  }
}
