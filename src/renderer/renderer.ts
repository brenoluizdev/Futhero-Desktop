import './styles.css';

interface ElectronAPI {
  launchGame: (game: 'bonk' | 'haxball') => Promise<{ success: boolean }>;
  closeGame: () => Promise<{ success: boolean }>;
  switchGame: (game: 'bonk' | 'haxball') => Promise<{ success: boolean }>;
  getCurrentGame: () => Promise<'bonk' | 'haxball' | null>;
  getAppVersion: () => Promise<string>;
  quitAndInstall: () => Promise<void>;
  onGameLoaded: (callback: (game: string) => void) => void;
  onGameClosed: (callback: () => void) => void;
  onUpdateAvailable: (callback: () => void) => void;
  onUpdateDownloaded: (callback: () => void) => void;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

class LauncherUI {
  private appElement: HTMLElement | null;
  
  constructor() {
    this.appElement = document.getElementById('app');
    this.init();
  }

  private async init(): Promise<void> {
    // Carregar versão do app
    this.loadAppVersion();

    // Setup event listeners
    this.setupPlayButtons();
    this.setupUpdateListeners();
    this.setupGameLifecycle();
  }

  private async loadAppVersion(): Promise<void> {
    try {
      const version = await window.electronAPI.getAppVersion();
      const versionEl = document.getElementById('app-version');
      if (versionEl) {
        versionEl.textContent = `v${version}`;
      }
    } catch (error) {
      console.error('Failed to load app version:', error);
    }
  }

  private setupPlayButtons(): void {
    const playButtons = document.querySelectorAll('.play-btn');
    
    playButtons.forEach(button => {
      button.addEventListener('click', async (e) => {
        const target = e.currentTarget as HTMLElement;
        const game = target.dataset.game as 'bonk' | 'haxball';
        
        if (!game) return;

        // Animação de loading
        target.classList.add('loading');
        target.textContent = 'Carregando...';

        try {
          await window.electronAPI.launchGame(game);
        } catch (error) {
          console.error('Failed to launch game:', error);
          target.textContent = 'Erro ao Carregar';
          
          setTimeout(() => {
            target.textContent = 'Jogar Agora';
            target.classList.remove('loading');
          }, 2000);
        }
      });
    });
  }

  private setupUpdateListeners(): void {
    const notification = document.getElementById('update-notification');
    const message = document.getElementById('update-message');
    const installBtn = document.getElementById('install-update-btn');

    // Update available
    window.electronAPI.onUpdateAvailable(() => {
      if (notification && message) {
        notification.style.display = 'flex';
        message.textContent = 'Baixando atualização...';
      }
    });

    // Update downloaded
    window.electronAPI.onUpdateDownloaded(() => {
      if (notification && message && installBtn) {
        message.textContent = 'Atualização pronta!';
        installBtn.style.display = 'block';
        
        installBtn.addEventListener('click', () => {
          window.electronAPI.quitAndInstall();
        });
      }
    });
  }

  private setupGameLifecycle(): void {
    // Quando o jogo é carregado
    window.electronAPI.onGameLoaded((game: string) => {
      if (this.appElement) {
        this.appElement.style.display = 'none';
      }
    });

    // Quando o jogo é fechado
    window.electronAPI.onGameClosed(() => {
      if (this.appElement) {
        this.appElement.style.display = 'flex';
      }

      // Reset button states
      const playButtons = document.querySelectorAll('.play-btn');
      playButtons.forEach(btn => {
        btn.classList.remove('loading');
        btn.textContent = 'Jogar Agora';
      });
    });
  }
}

// Initialize quando o DOM estiver pronto
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new LauncherUI());
} else {
  new LauncherUI();
}