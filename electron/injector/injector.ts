/**
 * Script de injeção DOM para criar o modal do launcher dentro do jogo
 * Este arquivo é injetado no contexto do jogo via executeJavaScript
 */

interface GameUIState {
  isOpen: boolean;
  currentTab: "settings" | "games" | "donate" | "about" | "logs";
}

const gameUIState: GameUIState = {
  isOpen: false,
  currentTab: "settings",
};

/**
 * Cria o HTML do modal
 */
function createModalHTML(): string {
  return `
    <div id="game-launcher-modal" class="game-launcher-modal">
      <div class="modal-overlay"></div>
      <div class="modal-container">
        <div class="modal-header">
          <h1 class="modal-title">Game Launcher</h1>
          <button class="modal-close" id="modal-close-btn">✕</button>
        </div>

        <div class="modal-tabs">
          <button class="tab-btn active" data-tab="settings">⚙️ Configurações</button>
          <button class="tab-btn" data-tab="games">🎮 Mudar Jogo</button>
          <button class="tab-btn" data-tab="donate">💝 Apoiar</button>
          <button class="tab-btn" data-tab="about">ℹ️ Sobre</button>
          <button class="tab-btn" data-tab="logs">📋 Logs</button>
        </div>

        <div class="modal-content">
          <!-- Aba: Configurações -->
          <div class="tab-content active" id="tab-settings">
            <h2>Configurações do Launcher</h2>
            <div class="settings-group">
              <label>
                <input type="checkbox" id="auto-update" checked />
                Atualização Automática
              </label>
            </div>
            <div class="settings-group">
              <label>
                <input type="checkbox" id="notifications" checked />
                Notificações
              </label>
            </div>
            <div class="settings-group">
              <label>
                <input type="checkbox" id="sound" checked />
                Som
              </label>
            </div>
            <button class="btn btn-primary" id="check-updates-btn">Verificar Atualizações</button>
          </div>

          <!-- Aba: Mudar Jogo -->
          <div class="tab-content" id="tab-games">
            <h2>Escolha um Jogo</h2>
            <div class="games-grid">
              <button class="game-card" data-game="bonk">
                <div class="game-icon">🎯</div>
                <div class="game-name">Bonk.io</div>
                <div class="game-desc">Jogo de combate multiplayer</div>
              </button>
              <button class="game-card" data-game="haxball">
                <div class="game-icon">⚽</div>
                <div class="game-name">Haxball</div>
                <div class="game-desc">Futebol multiplayer</div>
              </button>
            </div>
          </div>

          <!-- Aba: Apoiar -->
          <div class="tab-content" id="tab-donate">
            <h2>Apoie o Projeto</h2>
            <p>Gostou do launcher? Considere apoiar o desenvolvimento!</p>
            <div class="donate-options">
              <button class="donate-btn">☕ Café (R\$ 5)</button>
              <button class="donate-btn">🍕 Pizza (R\$ 15)</button>
              <button class="donate-btn">🎮 Premium (R\$ 30)</button>
            </div>
            <p class="donate-info">Seus apoios ajudam a manter o projeto ativo e com novas features!</p>
          </div>

          <!-- Aba: Sobre -->
          <div class="tab-content" id="tab-about">
            <h2>Sobre o Game Launcher</h2>
            <div class="about-info">
              <p><strong>Versão:</strong> <span id="app-version">1.0.0</span></p>
              <p><strong>Desenvolvido com:</strong> Electron + TypeScript</p>
              <p><strong>Descrição:</strong> Um launcher profissional e moderno para seus jogos favoritos.</p>
              <div class="about-features">
                <h3>Recursos:</h3>
                <ul>
                  <li>✅ Interface moderna e responsiva</li>
                  <li>✅ Suporte a múltiplos jogos</li>
                  <li>✅ Atualizações automáticas</li>
                  <li>✅ Modal integrado no jogo</li>
                  <li>✅ 100% seguro com contextIsolation</li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Aba: Logs -->
          <div class="tab-content" id="tab-logs">
            <h2>Logs da Aplicação</h2>
            <div class="logs-container" id="logs-container">
              <div class="log-entry">[INFO] Game Launcher iniciado</div>
              <div class="log-entry">[INFO] Modal injetado com sucesso</div>
            </div>
            <button class="btn btn-secondary" id="clear-logs-btn">Limpar Logs</button>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-secondary" id="modal-close-footer">Fechar</button>
        </div>
      </div>
    </div>
  `;
}

/**
 * Cria o CSS do modal
 */
function createModalStyles(): string {
  return `
    <style id="game-launcher-styles">
      :root {
        --primary-color: #ff8c42;
        --primary-dark: #ff6b1a;
        --secondary-color: #2c3e50;
        --text-color: #ffffff;
        --bg-color: #1a1a1a;
        --border-color: #ff8c42;
      }

      .game-launcher-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 999999;
        display: none;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      }

      .game-launcher-modal.active {
        display: flex;
      }

      .modal-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        backdrop-filter: blur(4px);
        animation: fadeIn 0.3s ease-in-out;
      }

      .modal-container {
        position: relative;
        margin: auto;
        width: 90%;
        max-width: 800px;
        height: 90%;
        max-height: 600px;
        background: linear-gradient(135deg, #1a1a1a 0%, #2c2c2c 100%);
        border-radius: 16px;
        border: 2px solid var(--primary-color);
        display: flex;
        flex-direction: column;
        box-shadow: 0 20px 60px rgba(255, 140, 66, 0.3);
        animation: slideUp 0.3s ease-out;
        overflow: hidden;
      }

      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }

      @keyframes slideUp {
        from {
          transform: translateY(50px);
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
        padding: 20px;
        border-bottom: 2px solid var(--primary-color);
        background: linear-gradient(90deg, var(--primary-color) 0%, var(--primary-dark) 100%);
      }

      .modal-title {
        margin: 0;
        font-size: 24px;
        font-weight: 700;
        color: var(--text-color);
      }

      .modal-close {
        background: rgba(255, 255, 255, 0.2);
        border: none;
        color: var(--text-color);
        font-size: 24px;
        cursor: pointer;
        padding: 5px 10px;
        border-radius: 6px;
        transition: all 0.2s ease;
      }

      .modal-close:hover {
        background: rgba(255, 255, 255, 0.3);
        transform: scale(1.1);
      }

      .modal-tabs {
        display: flex;
        gap: 10px;
        padding: 15px 20px;
        border-bottom: 1px solid rgba(255, 140, 66, 0.3);
        background: rgba(0, 0, 0, 0.3);
        overflow-x: auto;
      }

      .tab-btn {
        padding: 8px 16px;
        background: rgba(255, 140, 66, 0.1);
        border: 1px solid rgba(255, 140, 66, 0.3);
        color: var(--text-color);
        border-radius: 8px;
        cursor: pointer;
        font-size: 14px;
        font-weight: 500;
        white-space: nowrap;
        transition: all 0.2s ease;
      }

      .tab-btn:hover {
        background: rgba(255, 140, 66, 0.2);
        border-color: var(--primary-color);
      }

      .tab-btn.active {
        background: var(--primary-color);
        border-color: var(--primary-color);
        color: var(--text-color);
      }

      .modal-content {
        flex: 1;
        overflow-y: auto;
        padding: 20px;
      }

      .tab-content {
        display: none;
        animation: fadeIn 0.2s ease-in;
      }

      .tab-content.active {
        display: block;
      }

      .tab-content h2 {
        margin-top: 0;
        margin-bottom: 20px;
        color: var(--primary-color);
        font-size: 20px;
      }

      .settings-group {
        margin-bottom: 15px;
      }

      .settings-group label {
        display: flex;
        align-items: center;
        color: var(--text-color);
        cursor: pointer;
        font-size: 14px;
      }

      .settings-group input[type="checkbox"] {
        margin-right: 10px;
        cursor: pointer;
        accent-color: var(--primary-color);
      }

      .games-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 15px;
      }

      .game-card {
        padding: 20px;
        background: linear-gradient(135deg, rgba(255, 140, 66, 0.1) 0%, rgba(255, 140, 66, 0.05) 100%);
        border: 2px solid rgba(255, 140, 66, 0.3);
        border-radius: 12px;
        color: var(--text-color);
        cursor: pointer;
        transition: all 0.3s ease;
        text-align: center;
      }

      .game-card:hover {
        border-color: var(--primary-color);
        background: linear-gradient(135deg, rgba(255, 140, 66, 0.2) 0%, rgba(255, 140, 66, 0.1) 100%);
        transform: translateY(-5px);
      }

      .game-icon {
        font-size: 40px;
        margin-bottom: 10px;
      }

      .game-name {
        font-weight: 600;
        margin-bottom: 5px;
      }

      .game-desc {
        font-size: 12px;
        color: rgba(255, 255, 255, 0.7);
      }

      .donate-options {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
        gap: 10px;
        margin: 20px 0;
      }

      .donate-btn {
        padding: 15px;
        background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%);
        border: none;
        color: white;
        border-radius: 8px;
        cursor: pointer;
        font-weight: 600;
        transition: all 0.2s ease;
      }

      .donate-btn:hover {
        transform: translateY(-3px);
        box-shadow: 0 10px 20px rgba(255, 140, 66, 0.3);
      }

      .donate-info {
        color: rgba(255, 255, 255, 0.7);
        font-size: 12px;
        margin-top: 15px;
      }

      .about-info {
        color: var(--text-color);
      }

      .about-info p {
        margin: 10px 0;
      }

      .about-features {
        margin-top: 20px;
        padding: 15px;
        background: rgba(255, 140, 66, 0.1);
        border-left: 3px solid var(--primary-color);
        border-radius: 8px;
      }

      .about-features h3 {
        margin-top: 0;
        color: var(--primary-color);
      }

      .about-features ul {
        margin: 10px 0;
        padding-left: 20px;
      }

      .about-features li {
        margin: 5px 0;
      }

      .logs-container {
        background: rgba(0, 0, 0, 0.5);
        border-radius: 8px;
        padding: 15px;
        max-height: 300px;
        overflow-y: auto;
        margin-bottom: 15px;
        font-family: 'Courier New', monospace;
        font-size: 12px;
      }

      .log-entry {
        color: var(--primary-color);
        margin: 5px 0;
        padding: 5px;
        border-left: 2px solid var(--primary-color);
        padding-left: 10px;
      }

      .btn {
        padding: 10px 20px;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-weight: 600;
        transition: all 0.2s ease;
        font-size: 14px;
      }

      .btn-primary {
        background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%);
        color: white;
      }

      .btn-primary:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 16px rgba(255, 140, 66, 0.3);
      }

      .btn-secondary {
        background: rgba(255, 140, 66, 0.1);
        color: var(--primary-color);
        border: 1px solid var(--primary-color);
      }

      .btn-secondary:hover {
        background: rgba(255, 140, 66, 0.2);
      }

      .modal-footer {
        padding: 15px 20px;
        border-top: 1px solid rgba(255, 140, 66, 0.3);
        background: rgba(0, 0, 0, 0.3);
        display: flex;
        justify-content: flex-end;
        gap: 10px;
      }

      /* Botão flutuante no canto inferior direito */
      .game-launcher-fab {
        position: fixed;
        bottom: 30px;
        right: 30px;
        width: 60px;
        height: 60px;
        background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%);
        border: none;
        border-radius: 50%;
        color: white;
        font-size: 28px;
        cursor: pointer;
        z-index: 999998;
        box-shadow: 0 10px 30px rgba(255, 140, 66, 0.4);
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .game-launcher-fab:hover {
        transform: scale(1.1);
        box-shadow: 0 15px 40px rgba(255, 140, 66, 0.5);
      }

      .game-launcher-fab:active {
        transform: scale(0.95);
      }

      /* Responsividade */
      @media (max-width: 600px) {
        .modal-container {
          width: 95%;
          height: 95%;
          max-height: 90vh;
        }

        .modal-tabs {
          flex-wrap: wrap;
        }

        .games-grid {
          grid-template-columns: 1fr;
        }

        .game-launcher-fab {
          bottom: 20px;
          right: 20px;
          width: 50px;
          height: 50px;
          font-size: 24px;
        }
      }
    </style>
  `;
}

/**
 * Inicializa o modal
 */
function initializeGameUI() {
  // Verificar se já foi injetado
  if (document.getElementById("game-launcher-modal")) {
    return;
  }

  // Criar container para o modal
  const container = document.createElement("div");
  container.innerHTML = createModalHTML() + createModalStyles();
  document.body.appendChild(container);

  // Criar botão flutuante (FAB)
  const fab = document.createElement("button");
  fab.className = "game-launcher-fab";
  fab.innerHTML = "⚙️";
  fab.title = "Abrir Game Launcher";
  document.body.appendChild(fab);

  // Obter referências dos elementos
  const modal = document.getElementById("game-launcher-modal")!;
  const closeBtn = document.getElementById("modal-close-btn")!;
  const closeFooterBtn = document.getElementById("modal-close-footer")!;
  const tabBtns = document.querySelectorAll(".tab-btn");
  const tabContents = document.querySelectorAll(".tab-content");
  const gameCards = document.querySelectorAll(".game-card");
  const checkUpdatesBtn = document.getElementById("check-updates-btn")!;
  const clearLogsBtn = document.getElementById("clear-logs-btn")!;

  // Event listeners
  fab.addEventListener("click", () => {
    modal.classList.toggle("active");
    gameUIState.isOpen = modal.classList.contains("active");
  });

  closeBtn.addEventListener("click", () => {
    modal.classList.remove("active");
    gameUIState.isOpen = false;
  });

  closeFooterBtn.addEventListener("click", () => {
    modal.classList.remove("active");
    gameUIState.isOpen = false;
  });

  // Fechar ao clicar no overlay
  const overlay = modal.querySelector(".modal-overlay");
  overlay?.addEventListener("click", () => {
    modal.classList.remove("active");
    gameUIState.isOpen = false;
  });

  // Tabs
  tabBtns.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const target = e.target as HTMLElement;
      const tabName = target.getAttribute("data-tab") as
        | "settings"
        | "games"
        | "donate"
        | "about"
        | "logs";

      // Remover active de todos os tabs
      tabBtns.forEach((b) => b.classList.remove("active"));
      tabContents.forEach((c) => c.classList.remove("active"));

      // Adicionar active ao tab clicado
      target.classList.add("active");
      document.getElementById(`tab-${tabName}`)?.classList.add("active");

      gameUIState.currentTab = tabName;
    });
  });

  // Game cards
  gameCards.forEach((card) => {
    card.addEventListener("click", (e) => {
      const gameName = (e.currentTarget as HTMLElement).getAttribute("data-game");
      console.log(`Mudando para jogo: ${gameName}`);
      addLog(`[INFO] Mudando para jogo: ${gameName}`);
      // Aqui você pode chamar a API do Electron para mudar de jogo
    });
  });

  // Check updates
  checkUpdatesBtn.addEventListener("click", async () => {
    addLog("[INFO] Verificando atualizações...");
    // Aqui você pode chamar a API do Electron para verificar atualizações
  });

  // Clear logs
  clearLogsBtn.addEventListener("click", () => {
    const logsContainer = document.getElementById("logs-container")!;
    logsContainer.innerHTML = "";
    addLog("[INFO] Logs limpos");
  });

  // Fechar modal com ESC
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && gameUIState.isOpen) {
      modal.classList.remove("active");
      gameUIState.isOpen = false;
    }
  });

  addLog("[INFO] Game Launcher UI injetada com sucesso");
}

/**
 * Adiciona uma entrada aos logs
 */
function addLog(message: string) {
  const logsContainer = document.getElementById("logs-container");
  if (logsContainer) {
    const logEntry = document.createElement("div");
    logEntry.className = "log-entry";
    logEntry.textContent = message;
    logsContainer.appendChild(logEntry);
    logsContainer.scrollTop = logsContainer.scrollHeight;
  }
}

// Inicializar quando o DOM estiver pronto
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeGameUI);
} else {
  initializeGameUI();
}

// Exportar para uso global
(window as any).gameUIState = gameUIState;
(window as any).addLog = addLog;
