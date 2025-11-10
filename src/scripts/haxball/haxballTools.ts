(() => {
  console.log('[Launcher] Haxball tools initialized.');

  const isInRoom = () => {
    return window.location.href.includes('/play?c=');
  };

  const addKeyboardShortcuts = () => {
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.key === 'r') {
        console.log('[Launcher] Recarregando página...');
      }
      
      if (e.ctrlKey && e.key === 'm') {
        console.log('[Launcher] Toggle mute (funcionalidade futura)');
      }
    });
  };

  const applyVisualEnhancements = () => {
   /*const elementsToHide = [
    ];

    elementsToHide.forEach(selector => {
      const el = document.querySelector(selector);
      if (el) {
        el.style.display = 'none';
        console.log(`[Launcher] Elemento oculto: ${selector}`);
      }
    }); */
  };

  const setupAutoReconnect = () => {
    const observer = new MutationObserver(() => {
      const disconnectMsg = document.querySelector('[class*="disconnect"]');
      if (disconnectMsg) {
        console.log('[Launcher] Desconexão detectada. Auto-reconnect disponível.');
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
  };

  const enhancePingDisplay = () => {
    setInterval(() => {
    }, 1000);
  };

  const init = () => {
    addKeyboardShortcuts();
    applyVisualEnhancements();
    setupAutoReconnect();
    
    if (isInRoom()) {
      console.log('[Launcher] Sala detectada - ferramentas de jogo ativadas');
      enhancePingDisplay();
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  console.log('[Launcher] Haxball tools ready.');
})();