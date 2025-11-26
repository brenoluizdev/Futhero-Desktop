/**
 * Renderer Script
 * Lógica da interface do launcher
 */

// Elementos DOM
const playButtons = document.querySelectorAll('.btn-play');
const checkUpdatesBtn = document.getElementById('check-updates-btn');
const updateNotification = document.getElementById('update-notification');
const notificationTitle = document.getElementById('notification-title');
const notificationMessage = document.getElementById('notification-message');
const notificationClose = document.getElementById('notification-close');
const updateStatus = document.getElementById('update-status');

// Event Listeners
playButtons.forEach((button) => {
  button.addEventListener('click', async (e) => {
    const target = e.currentTarget as HTMLElement;
    const gameType = target.getAttribute('data-game');
    
    if (gameType) {
      try {
        // Desabilitar botão durante carregamento
        target.setAttribute('disabled', 'true');
        target.textContent = 'Carregando...';
        
        // Lançar jogo
        await window.electronAPI.launchGame(gameType as any);
      } catch (error) {
        console.error('Erro ao lançar jogo:', error);
        alert('Erro ao lançar o jogo. Tente novamente.');
        
        // Restaurar botão
        target.removeAttribute('disabled');
        const icon = document.createElement('span');
        icon.className = 'btn-play-icon';
        icon.textContent = '▶';
        target.textContent = `Jogar ${gameType === 'bonk' ? 'Bonk.io' : 'Haxball'}`;
        target.prepend(icon);
      }
    }
  });
});

// Verificar atualizações
checkUpdatesBtn?.addEventListener('click', async () => {
  try {
    await window.electronAPI.checkUpdates();
    showNotification('Verificando atualizações...', 'Aguarde enquanto verificamos se há novas versões disponíveis.');
  } catch (error) {
    console.error('Erro ao verificar atualizações:', error);
  }
});

// Fechar notificação
notificationClose?.addEventListener('click', () => {
  updateNotification?.classList.add('hidden');
});

// Listeners de atualização
window.electronAPI.onUpdateAvailable((info) => {
  console.log('Atualização disponível:', info);
  showNotification(
    'Atualização disponível',
    `Versão ${info.version} está sendo baixada automaticamente.`
  );
  if (updateStatus) {
    updateStatus.textContent = 'Baixando atualização...';
  }
});

window.electronAPI.onUpdateDownloaded((info) => {
  console.log('Atualização baixada:', info);
  showNotification(
    'Atualização pronta',
    'A atualização será instalada quando você fechar o launcher.'
  );
  if (updateStatus) {
    updateStatus.textContent = 'Atualização pronta para instalar';
  }
});

window.electronAPI.onUpdateError((error) => {
  console.error('Erro na atualização:', error);
  showNotification(
    'Erro na atualização',
    'Não foi possível baixar a atualização. Tente novamente mais tarde.'
  );
  if (updateStatus) {
    updateStatus.textContent = '';
  }
});

// Função auxiliar para mostrar notificações
function showNotification(title: string, message: string): void {
  if (notificationTitle && notificationMessage && updateNotification) {
    notificationTitle.textContent = title;
    notificationMessage.textContent = message;
    updateNotification.classList.remove('hidden');
    
    // Auto-fechar após 5 segundos
    setTimeout(() => {
      updateNotification.classList.add('hidden');
    }, 5000);
  }
}

// Carregar configuração inicial
(async () => {
  try {
    const config = await window.electronAPI.getConfig();
    console.log('Configuração carregada:', config);
  } catch (error) {
    console.error('Erro ao carregar configuração:', error);
  }
})();
