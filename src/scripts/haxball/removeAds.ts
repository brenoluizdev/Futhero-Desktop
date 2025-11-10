(() => {
  console.log('[Launcher] Haxball ad cleaner initialized.');

  const remove = () => {
    const haxballAdIds = [
      'adbox-vertical-left',
      'adbox-vertical-right',
      'adbox-horizontal-top',
      'adbox-horizontal-bottom'
    ];

    const adSelectors = [
      'iframe[id^="google_ads_iframe_"]',
      'div[id^="google_ads_iframe_"]',
      'div[id*="gpt"]',
      'div[id*="ad-"]',
      'div[class*="ad-container"]',
      'div[class*="adbox"]',
      'div[class*="advertisement"]',
      'iframe[src*="googlesyndication"]',
      'iframe[src*="doubleclick"]',
      'iframe[src*="adsystem"]',
      'script[src*="ads"]',
      'script[src*="googlesyndication"]',
      'script[src*="doubleclick"]',
    ];

    haxballAdIds.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.remove();
        console.log(`[Launcher] Removed Haxball ad container: #${id}`);
      }
    });

    document.querySelectorAll(adSelectors.join(',')).forEach(el => {
      if (el.id === 'gameCanvas' || el.closest('#gameCanvas')) return;
      el.remove();
    });
  };

  const observer = new MutationObserver(remove);
  observer.observe(document.body, { childList: true, subtree: true });
  
  setInterval(remove, 800);
  
  remove();

  console.log('[Launcher] Haxball ad removal active.');
})();