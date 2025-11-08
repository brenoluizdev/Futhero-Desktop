export function hideUnwantedElements() {
  const hide = () => {
    const elements = ['#cookieBanner', '#promoPopup'];
    elements.forEach(sel => document.querySelector(sel)?.remove());
  };

  hide();
}
