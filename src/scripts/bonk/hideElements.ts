(() => {
  const hide = () => {
    const elements = [
      '#cookieBanner', '#promoPopup', '#bonkioheader', 
      '#adboxverticalCurse', '#descriptioncontainer'
    ];
    elements.forEach(sel => document.querySelector(sel)?.remove());
  };

  window.addEventListener('load', hide);
  console.log('[Launcher] Hide elements script loaded.');
})();
