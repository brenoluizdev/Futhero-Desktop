(() => {
  console.log('[Haxball Ad Cleaner] Inicializado.');

  const cleanAds = () => {
    const rightbar = document.querySelector('.rightbar');
    if (rightbar) {
      rightbar.remove();
      console.log('[Haxball Ad Cleaner] Contêiner de anúncios ".rightbar" removido.');
    }

    const mainContainer: any = document.querySelector('.container.flexRow');
    if (mainContainer) {
      mainContainer.style.display = 'flex'; 
    }

    const gameContainer: any = document.querySelector('.flexCol.flexGrow');
    if (gameContainer) {
      gameContainer.style.width = '100%';
    }
  };

  const observer = new MutationObserver((mutations) => {
    let needsCleaning = false;
    for (const mutation of mutations) {
      if (mutation.addedNodes.length) {
        for (const node of mutation.addedNodes) {
          if (node.nodeType === 1 && (node as HTMLElement).classList?.contains('rightbar')) {
            needsCleaning = true;
            break;
          }
        }
      }
      if (needsCleaning) break;
    }

    if (needsCleaning) {
      console.log('[Haxball Ad Cleaner] Detectou a recriação de anúncios. Limpando novamente...');
      cleanAds();
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  cleanAds();

  console.log('[Haxball Ad Cleaner] Modo de remoção de anúncios ativado.');
})();
