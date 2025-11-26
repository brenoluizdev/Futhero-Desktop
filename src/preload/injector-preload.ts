/**
 * Injector Preload Script
 * Injeta UI customizada no jogo via DOM
 */

import { contextBridge, ipcRenderer } from 'electron';

// API para o injector
const injectorAPI = {
  toggleModal: (data: any) => ipcRenderer.send('toggle-modal', data),
  onToggleModal: (callback: (data: any) => void) => {
    ipcRenderer.on('toggle-modal', (_event, data) => callback(data));
  },
};

// Expor API
contextBridge.exposeInMainWorld('injectorAPI', injectorAPI);

// Injetar UI quando o DOM estiver pronto
window.addEventListener('DOMContentLoaded', () => {
  injectLauncherUI();
});

/**
 * Injeta a UI do launcher no jogo
 */
function injectLauncherUI(): void {
  // Criar container do botão
  const buttonContainer = document.createElement('div');
  buttonContainer.id = 'launcher-button-container';
  buttonContainer.innerHTML = `
    <button id="launcher-toggle-btn" title="Abrir menu do launcher">
      <span class="launcher-icon">🎮</span>
    </button>
  `;
  
  // Criar container do modal
  const modalContainer = document.createElement('div');
  modalContainer.id = 'launcher-modal-container';
  modalContainer.className = 'hidden';
  modalContainer.innerHTML = `
    <div class="launcher-modal-overlay"></div>
    <div class="launcher-modal">
      <div class="launcher-modal-header">
        <h2>Game Launcher</h2>
        <button id="launcher-modal-close" class="launcher-btn-close">✕</button>
      </div>
      <div class="launcher-modal-content">
        <nav class="launcher-modal-nav">
          <button class="launcher-nav-item active" data-section="settings">
            <span class="launcher-nav-icon">⚙️</span>
            Configurações
          </button>
          <button class="launcher-nav-item" data-section="switch">
            <span class="launcher-nav-icon">🔄</span>
            Trocar Jogo
          </button>
          <button class="launcher-nav-item" data-section="donate">
            <span class="launcher-nav-icon">💝</span>
            Apoiar
          </button>
          <button class="launcher-nav-item" data-section="about">
            <span class="launcher-nav-icon">ℹ️</span>
            Sobre
          </button>
        </nav>
        <div class="launcher-modal-body">
          <!-- Settings Section -->
          <div class="launcher-section active" data-section="settings">
            <h3>Configurações do Launcher</h3>
            <div class="launcher-setting-item">
              <label>
                <input type="checkbox" id="auto-update-toggle" checked>
                <span>Atualizações automáticas</span>
              </label>
              <p class="launcher-setting-description">
                Baixar e instalar atualizações automaticamente
              </p>
            </div>
            <div class="launcher-setting-item">
              <label>
                <span>Tema</span>
                <select id="theme-select">
                  <option value="dark">Escuro</option>
                  <option value="light">Claro</option>
                </select>
              </label>
            </div>
            <button class="launcher-btn-primary" id="close-game-btn">
              Fechar Jogo e Voltar ao Launcher
            </button>
          </div>

          <!-- Switch Game Section -->
          <div class="launcher-section" data-section="switch">
            <h3>Trocar de Jogo</h3>
            <div class="launcher-game-switch">
              <button class="launcher-game-option" data-game="bonk">
                <div class="launcher-game-icon bonk">B</div>
                <span>Bonk.io</span>
              </button>
              <button class="launcher-game-option" data-game="haxball">
                <div class="launcher-game-icon haxball">H</div>
                <span>Haxball</span>
              </button>
            </div>
          </div>

          <!-- Donate Section -->
          <div class="launcher-section" data-section="donate">
            <h3>Apoiar o Projeto</h3>
            <p class="launcher-text">
              Se você está gostando do Game Launcher, considere apoiar o desenvolvimento!
            </p>
            <div class="launcher-donate-options">
              <a href="#" class="launcher-donate-btn" data-method="paypal">
                <span>💳</span> PayPal
              </a>
              <a href="#" class="launcher-donate-btn" data-method="pix">
                <span>📱</span> PIX
              </a>
              <a href="#" class="launcher-donate-btn" data-method="crypto">
                <span>₿</span> Crypto
              </a>
            </div>
          </div>

          <!-- About Section -->
          <div class="launcher-section" data-section="about">
            <h3>Sobre o Game Launcher</h3>
            <p class="launcher-text">
              <strong>Versão:</strong> 1.0.0<br>
              <strong>Desenvolvido com:</strong> Electron + TypeScript<br>
              <strong>Jogos disponíveis:</strong> Bonk.io, Haxball
            </p>
            <p class="launcher-text">
              Game Launcher é um projeto de código aberto que reúne seus jogos online favoritos em um único aplicativo desktop moderno e fácil de usar.
            </p>
            <div class="launcher-links">
              <a href="#" class="launcher-link" data-link="github">GitHub</a>
              <a href="#" class="launcher-link" data-link="discord">Discord</a>
              <a href="#" class="launcher-link" data-link="website">Website</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
  
  // Adicionar estilos
  const styles = document.createElement('style');
  styles.textContent = getInjectedStyles();
  
  // Adicionar ao DOM
  document.body.appendChild(styles);
  document.body.appendChild(buttonContainer);
  document.body.appendChild(modalContainer);
  
  // Adicionar event listeners
  setupEventListeners();
}

/**
 * Configura event listeners da UI injetada
 */
function setupEventListeners(): void {
  const toggleBtn = document.getElementById('launcher-toggle-btn');
  const modalContainer = document.getElementById('launcher-modal-container');
  const closeBtn = document.getElementById('launcher-modal-close');
  const overlay = modalContainer?.querySelector('.launcher-modal-overlay');
  const navItems = document.querySelectorAll('.launcher-nav-item');
  const closeGameBtn = document.getElementById('close-game-btn');
  const gameSwitchBtns = document.querySelectorAll('.launcher-game-option');
  
  // Toggle modal
  toggleBtn?.addEventListener('click', () => {
    modalContainer?.classList.toggle('hidden');
  });
  
  // Fechar modal
  closeBtn?.addEventListener('click', () => {
    modalContainer?.classList.add('hidden');
  });
  
  overlay?.addEventListener('click', () => {
    modalContainer?.classList.add('hidden');
  });
  
  // Navegação
  navItems.forEach((item) => {
    item.addEventListener('click', () => {
      const section = item.getAttribute('data-section');
      
      // Atualizar nav ativa
      navItems.forEach((nav) => nav.classList.remove('active'));
      item.classList.add('active');
      
      // Mostrar seção
      const sections = document.querySelectorAll('.launcher-section');
      sections.forEach((sec) => {
        if (sec.getAttribute('data-section') === section) {
          sec.classList.add('active');
        } else {
          sec.classList.remove('active');
        }
      });
    });
  });
  
  // Fechar jogo
  closeGameBtn?.addEventListener('click', async () => {
    try {
      // Enviar mensagem para o main process
      (window as any).injectorAPI.toggleModal({ action: 'close-game' });
      modalContainer?.classList.add('hidden');
    } catch (error) {
      console.error('Erro ao fechar jogo:', error);
    }
  });
  
  // Trocar jogo
  gameSwitchBtns.forEach((btn) => {
    btn.addEventListener('click', async () => {
      const game = btn.getAttribute('data-game');
      if (game) {
        try {
          (window as any).injectorAPI.toggleModal({ 
            action: 'switch-game', 
            game 
          });
          modalContainer?.classList.add('hidden');
        } catch (error) {
          console.error('Erro ao trocar jogo:', error);
        }
      }
    });
  });
}

/**
 * Retorna os estilos CSS injetados
 */
function getInjectedStyles(): string {
  return `
    /* Launcher Button */
    #launcher-button-container {
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 999999;
    }
    
    #launcher-toggle-btn {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: linear-gradient(135deg, #FF6B35, #F7931E);
      border: none;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3), 0 0 20px rgba(255, 107, 53, 0.4);
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    #launcher-toggle-btn:hover {
      transform: scale(1.1);
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4), 0 0 30px rgba(255, 107, 53, 0.6);
    }
    
    #launcher-toggle-btn:active {
      transform: scale(0.95);
    }
    
    .launcher-icon {
      font-size: 28px;
      filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
    }
    
    /* Modal Container */
    #launcher-modal-container {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 1000000;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    #launcher-modal-container.hidden {
      display: none;
    }
    
    .launcher-modal-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      backdrop-filter: blur(4px);
    }
    
    .launcher-modal {
      position: relative;
      width: 90%;
      max-width: 900px;
      height: 80%;
      max-height: 600px;
      background: #1a1a1a;
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5), 0 0 40px rgba(255, 107, 53, 0.3);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      animation: modalSlideIn 0.3s ease;
    }
    
    @keyframes modalSlideIn {
      from {
        opacity: 0;
        transform: scale(0.9) translateY(20px);
      }
      to {
        opacity: 1;
        transform: scale(1) translateY(0);
      }
    }
    
    .launcher-modal-header {
      padding: 24px 30px;
      background: linear-gradient(135deg, #FF6B35, #F7931E);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .launcher-modal-header h2 {
      margin: 0;
      font-size: 24px;
      font-weight: 700;
      color: white;
    }
    
    .launcher-btn-close {
      background: transparent;
      border: none;
      color: white;
      font-size: 28px;
      cursor: pointer;
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 8px;
      transition: background 0.2s ease;
    }
    
    .launcher-btn-close:hover {
      background: rgba(255, 255, 255, 0.2);
    }
    
    .launcher-modal-content {
      flex: 1;
      display: flex;
      overflow: hidden;
    }
    
    .launcher-modal-nav {
      width: 220px;
      background: #252525;
      padding: 20px 0;
      display: flex;
      flex-direction: column;
      gap: 5px;
    }
    
    .launcher-nav-item {
      background: transparent;
      border: none;
      color: #b0b0b0;
      padding: 14px 24px;
      text-align: left;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 15px;
      transition: all 0.2s ease;
      border-left: 3px solid transparent;
    }
    
    .launcher-nav-item:hover {
      background: rgba(255, 107, 53, 0.1);
      color: #FF6B35;
    }
    
    .launcher-nav-item.active {
      background: rgba(255, 107, 53, 0.15);
      color: #FF6B35;
      border-left-color: #FF6B35;
      font-weight: 600;
    }
    
    .launcher-nav-icon {
      font-size: 20px;
    }
    
    .launcher-modal-body {
      flex: 1;
      padding: 30px;
      overflow-y: auto;
      position: relative;
    }
    
    .launcher-section {
      display: none;
    }
    
    .launcher-section.active {
      display: block;
      animation: fadeIn 0.3s ease;
    }
    
    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    .launcher-section h3 {
      margin: 0 0 24px 0;
      font-size: 22px;
      color: #FF6B35;
    }
    
    .launcher-setting-item {
      margin-bottom: 24px;
      padding: 16px;
      background: #252525;
      border-radius: 8px;
    }
    
    .launcher-setting-item label {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 16px;
      color: white;
      cursor: pointer;
    }
    
    .launcher-setting-item input[type="checkbox"] {
      width: 20px;
      height: 20px;
      cursor: pointer;
    }
    
    .launcher-setting-item select {
      padding: 8px 12px;
      background: #1a1a1a;
      border: 1px solid #333;
      border-radius: 6px;
      color: white;
      font-size: 14px;
      cursor: pointer;
    }
    
    .launcher-setting-description {
      margin: 8px 0 0 32px;
      font-size: 13px;
      color: #b0b0b0;
    }
    
    .launcher-btn-primary {
      background: linear-gradient(135deg, #FF6B35, #F7931E);
      border: none;
      color: white;
      padding: 12px 24px;
      border-radius: 8px;
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      margin-top: 16px;
    }
    
    .launcher-btn-primary:hover {
      transform: scale(1.05);
      box-shadow: 0 4px 12px rgba(255, 107, 53, 0.4);
    }
    
    .launcher-game-switch {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
    }
    
    .launcher-game-option {
      background: #252525;
      border: 2px solid #333;
      border-radius: 12px;
      padding: 24px;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      transition: all 0.2s ease;
      color: white;
      font-size: 16px;
      font-weight: 600;
    }
    
    .launcher-game-option:hover {
      border-color: #FF6B35;
      transform: translateY(-4px);
      box-shadow: 0 4px 12px rgba(255, 107, 53, 0.3);
    }
    
    .launcher-game-icon {
      width: 60px;
      height: 60px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 32px;
      font-weight: 700;
      color: white;
    }
    
    .launcher-game-icon.bonk {
      background: linear-gradient(135deg, #FF6B35, #F7931E);
    }
    
    .launcher-game-icon.haxball {
      background: linear-gradient(135deg, #F7931E, #FFA500);
    }
    
    .launcher-text {
      color: #b0b0b0;
      line-height: 1.8;
      margin-bottom: 16px;
    }
    
    .launcher-donate-options {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
    }
    
    .launcher-donate-btn {
      background: #252525;
      border: 2px solid #333;
      color: white;
      padding: 12px 24px;
      border-radius: 8px;
      text-decoration: none;
      display: flex;
      align-items: center;
      gap: 8px;
      transition: all 0.2s ease;
      font-weight: 600;
    }
    
    .launcher-donate-btn:hover {
      border-color: #FF6B35;
      background: rgba(255, 107, 53, 0.1);
      transform: translateY(-2px);
    }
    
    .launcher-links {
      display: flex;
      gap: 16px;
      margin-top: 20px;
    }
    
    .launcher-link {
      color: #FF6B35;
      text-decoration: none;
      font-weight: 600;
      transition: color 0.2s ease;
    }
    
    .launcher-link:hover {
      color: #F7931E;
      text-decoration: underline;
    }
    
    /* Scrollbar */
    .launcher-modal-body::-webkit-scrollbar {
      width: 8px;
    }
    
    .launcher-modal-body::-webkit-scrollbar-track {
      background: #1a1a1a;
    }
    
    .launcher-modal-body::-webkit-scrollbar-thumb {
      background: #333;
      border-radius: 4px;
    }
    
    .launcher-modal-body::-webkit-scrollbar-thumb:hover {
      background: #FF6B35;
    }
  `;
}
