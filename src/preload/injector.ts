import { contextBridge } from 'electron';

// Injeta menu flutuante no jogo
function injectGameMenu() {
  const style = document.createElement('style');
  style.textContent = `
    #game-launcher-menu {
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 60px;
      height: 60px;
      background: linear-gradient(135deg, #ff6b35 0%, #ff8c42 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      z-index: 999999;
      box-shadow: 0 4px 12px rgba(255, 107, 53, 0.4);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      border: 3px solid rgba(255, 255, 255, 0.2);
    }

    #game-launcher-menu:hover {
      transform: scale(1.1);
      box-shadow: 0 6px 20px rgba(255, 107, 53, 0.6);
    }

    #game-launcher-menu svg {
      width: 28px;
      height: 28px;
      fill: white;
      filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
    }

    #game-launcher-modal {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.85);
      backdrop-filter: blur(8px);
      z-index: 999998;
      display: none;
      animation: fadeIn 0.3s ease-out;
    }

    #game-launcher-modal.active {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }

    #game-launcher-modal-content {
      width: 90%;
      max-width: 900px;
      height: 85vh;
      background: linear-gradient(135deg, #2d2d2d 0%, #1a1a1a 100%);
      border-radius: 16px;
      padding: 32px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
      animation: slideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      overflow-y: auto;
      border: 2px solid rgba(255, 107, 53, 0.3);
    }

    @keyframes slideUp {
      from {
        transform: translateY(40px);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 32px;
      padding-bottom: 16px;
      border-bottom: 2px solid rgba(255, 107, 53, 0.2);
    }

    .modal-title {
      font-size: 28px;
      font-weight: 700;
      color: #ff6b35;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    }

    .modal-close {
      width: 40px;
      height: 40px;
      background: rgba(255, 255, 255, 0.1);
      border: none;
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    }

    .modal-close:hover {
      background: rgba(255, 107, 53, 0.2);
      transform: rotate(90deg);
    }

    .modal-nav {
      display: flex;
      gap: 12px;
      margin-bottom: 24px;
      flex-wrap: wrap;
    }

    .modal-nav-btn {
      padding: 12px 24px;
      background: rgba(255, 255, 255, 0.05);
      border: 2px solid transparent;
      border-radius: 8px;
      color: #ccc;
      cursor: pointer;
      font-size: 15px;
      font-weight: 600;
      transition: all 0.2s;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    }

    .modal-nav-btn:hover {
      background: rgba(255, 107, 53, 0.1);
      color: #ff6b35;
    }

    .modal-nav-btn.active {
      background: linear-gradient(135deg, #ff6b35 0%, #ff8c42 100%);
      color: white;
      border-color: rgba(255, 255, 255, 0.2);
    }

    .modal-section {
      display: none;
      color: #e0e0e0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      line-height: 1.6;
    }

    .modal-section.active {
      display: block;
      animation: fadeIn 0.3s ease-out;
    }

    .modal-section h2 {
      color: #ff6b35;
      margin-bottom: 16px;
      font-size: 22px;
    }

    .modal-section p {
      margin-bottom: 12px;
      color: #b0b0b0;
    }

    .game-switch-btn {
      padding: 14px 28px;
      background: linear-gradient(135deg, #ff6b35 0%, #ff8c42 100%);
      border: none;
      border-radius: 8px;
      color: white;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      margin-top: 16px;
      transition: all 0.2s;
      box-shadow: 0 4px 12px rgba(255, 107, 53, 0.3);
    }

    .game-switch-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(255, 107, 53, 0.5);
    }
  `;
  document.head.appendChild(style);

  // Menu Button
  const menu = document.createElement('div');
  menu.id = 'game-launcher-menu';
  menu.innerHTML = `
    <svg viewBox="0 0 24 24">
      <path d="M12,16A2,2 0 0,1 14,18A2,2 0 0,1 12,20A2,2 0 0,1 10,18A2,2 0 0,1 12,16M12,10A2,2 0 0,1 14,12A2,2 0 0,1 12,14A2,2 0 0,1 10,12A2,2 0 0,1 12,10M12,4A2,2 0 0,1 14,6A2,2 0 0,1 12,8A2,2 0 0,1 10,6A2,2 0 0,1 12,4Z" />
    </svg>
  `;

  // Modal
  const modal = document.createElement('div');
  modal.id = 'game-launcher-modal';
  modal.innerHTML = `
    <div id="game-launcher-modal-content">
      <div class="modal-header">
        <div class="modal-title">Game Launcher</div>
        <button class="modal-close">✕</button>
      </div>
      
      <div class="modal-nav">
        <button class="modal-nav-btn active" data-section="config">Configurações</button>
        <button class="modal-nav-btn" data-section="switch">Trocar Jogo</button>
        <button class="modal-nav-btn" data-section="donate">Apoiar</button>
        <button class="modal-nav-btn" data-section="about">Sobre</button>
      </div>

      <div class="modal-section active" id="section-config">
        <h2>⚙️ Configurações</h2>
        <p>Versão do Launcher: <strong>1.0.0</strong></p>
        <p>Jogo Atual: <strong id="current-game-name">Carregando...</strong></p>
        <p>Configurações adicionais podem ser adicionadas aqui.</p>
      </div>

      <div class="modal-section" id="section-switch">
        <h2>🎮 Trocar de Jogo</h2>
        <p>Selecione o jogo que deseja jogar:</p>
        <button class="game-switch-btn" data-game="bonk">🏀 Jogar Bonk.io</button>
        <button class="game-switch-btn" data-game="haxball">⚽ Jogar Haxball</button>
      </div>

      <div class="modal-section" id="section-donate">
        <h2>💰 Apoiar o Projeto</h2>
        <p>Gostou do launcher? Considere apoiar o desenvolvimento!</p>
        <p>Sua contribuição ajuda a manter o projeto ativo e com melhorias constantes.</p>
      </div>

      <div class="modal-section" id="section-about">
        <h2>📝 Sobre o Projeto</h2>
        <p>Game Launcher - Versão 1.0.0</p>
        <p>Um launcher profissional e moderno para Bonk.io e Haxball.</p>
        <p>Desenvolvido com Electron + TypeScript</p>
        <p>© 2025 - Todos os direitos reservados</p>
      </div>
    </div>
  `;

  document.body.appendChild(menu);
  document.body.appendChild(modal);

  // Event Listeners
  menu.addEventListener('click', () => {
    modal.classList.add('active');
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('active');
    }
  });

  modal.querySelector('.modal-close')?.addEventListener('click', () => {
    modal.classList.remove('active');
  });

  // Navigation
  modal.querySelectorAll('.modal-nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const section = (btn as HTMLElement).dataset.section;
      
      modal.querySelectorAll('.modal-nav-btn').forEach(b => b.classList.remove('active'));
      modal.querySelectorAll('.modal-section').forEach(s => s.classList.remove('active'));
      
      btn.classList.add('active');
      modal.querySelector(`#section-${section}`)?.classList.add('active');
    });
  });

  // Game Switch (simulado - precisa de IPC real em produção)
  modal.querySelectorAll('.game-switch-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const game = (btn as HTMLElement).dataset.game;
      console.log(`Switching to ${game}`);
      // Em produção: window.electronAPI.switchGame(game)
    });
  });
}

// Injetar quando a página carregar
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', injectGameMenu);
} else {
  injectGameMenu();
}