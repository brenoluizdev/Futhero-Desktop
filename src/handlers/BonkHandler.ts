import { BrowserWindow, app } from "electron";
import { BaseGameHandler, GameConfig } from "./BaseGameHandler";

// Assumindo que BaseGameHandler e GameConfig estão definidos em outro lugar
// e que a classe BonkHandler estende BaseGameHandler.

export class BonkHandler extends BaseGameHandler {
  // Assumindo que BaseGameHandler mantém uma referência à janela ativa em 'this.window'
  // e que o método setWindow(window: BrowserWindow) é chamado pelo GameManager.

  constructor(scriptsBasePath: string) {
    super("BONKIO", "https://bonk.io", scriptsBasePath);
  }

  getDefaultConfig(): GameConfig {
    return {
      enableFPSControl: true,
      unlimitedFPS: false,
      fpsLimit: 120,
      customScriptsPath: "bonk",
      webPreferences: {
        webSecurity: false,
        allowRunningInsecureContent: true,
      }
    };
  }

  // Flags globais devem ser aplicadas no main.ts antes de app.ready
  applyCommandLineFlags(): void {
    // Esta função é chamada pelo GameManager.applyInitialFlags(gameType)
    // Se você estiver usando a nova estrutura, esta função deve ser vazia
    // e as flags globais devem estar no main.ts antes de app.ready.
    console.log('[BONKIO] applyCommandLineFlags: Nenhuma flag global aplicada aqui. Verifique se estão no main.ts antes de app.ready.');
  }

  onPageLoad(window: BrowserWindow): void {
    console.log("[BONKIO] Página carregada, aplicando customizações e injeção de scripts...");
    
    // O script fps-limiter.js será injetado pelo this.injectScripts(window)
    // que é chamado abaixo.

    // 1. Lógica de fixes de UI (mantida do seu código original)
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

    // 2. Injeção de scripts (incluindo o fps-limiter.js)
    this.injectScripts(window);
  }

  // Métodos de controle de FPS (assumindo que eles atualizam a configuração e a salvam)
  async toggleUnlimitedFPS(): Promise<boolean> {
    if (!this.config.enableFPSControl) {
      console.log("[BONKIO] FPS control está desabilitado");
      return false;
    }

    const oldUnlimited = this.config.unlimitedFPS;
    const newValue = !oldUnlimited;

    this.updateConfig({ 
      unlimitedFPS: newValue,
      fpsLimit: newValue ? null : this.config.fpsLimit 
    });
    
    console.log(`[BONKIO FPS] Estado alterado: ${newValue ? 'DESBLOQUEADO' : 'BLOQUEADO'}`);

    // Para aplicar a mudança dinamicamente, o script injetado deve ser reexecutado.
    // Como o script tem a verificação window.__futheroFpsLimiterActive,
    // a forma mais simples é recarregar a página ou notificar o usuário.
    // Se você quiser que seja dinâmico, você precisará de uma lógica para remover
    // o limitador antigo e injetar o novo, ou simplesmente confiar que o script
    // será reexecutado na próxima navegação.

    return oldUnlimited !== newValue;
  }

  async setFpsLimit(limit: number | null): Promise<boolean> {
    if (!this.config.enableFPSControl) {
      console.log("[BONKIO] FPS control está desabilitado");
      return false;
    }

    if (limit !== null && (typeof limit !== 'number' || limit < 0 || limit > 1000)) {
      console.error('[BONKIO FPS] Limite inválido:', limit);
      return false;
    }

    const oldLimit = this.config.fpsLimit;
    const oldUnlimited = this.config.unlimitedFPS;

    const newUnlimitedState = limit !== null ? false : oldUnlimited;

    this.updateConfig({
      fpsLimit: limit,
      unlimitedFPS: newUnlimitedState
    });

    console.log(`[BONKIO FPS] Limite definido: ${limit ?? 'nenhum'}`);

    // Para aplicar a mudança dinamicamente, o script injetado deve ser reexecutado.
    // Veja o comentário em toggleUnlimitedFPS.

    return oldLimit !== limit || oldUnlimited !== newUnlimitedState;
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
