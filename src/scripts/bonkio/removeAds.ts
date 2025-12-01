(() => {
  console.log('[Launcher] Bonk.io ad cleaner initialized.');

  const remove = () => {
    const bonkAdIds = ['adboxverticalleftCurse', 'adboxverticalrightCurse', 'bonk_d_1', 'bonk_d_2', 'bonkioheader'];

    const adSelectors = [
      'iframe[id^="google_ads_iframe_"]',
      'div[id^="google_ads_iframe_"]',
      'div[id*="gpt"]',
      'div[id*="bonk_D_"]',
      'div[class*="ad-container"]',
      'div[class*="adbox"]',
      'div[class*="ads"]',
      'iframe[src*="googlesyndication"]',
      'iframe[src*="doubleclick"]',
      'iframe[src*="adsystem"]',
      'iframe[src*="btloader.com"]',
      'script[src*="ads"]',
      'script[src*="googlesyndication"]',
      'script[src*="doubleclick"]',
      'script[src*="prebid"]',
    ];

    bonkAdIds.forEach(id => {
      const el = document.getElementById(id);
      if (el && !el.closest('#maingameframe')) {
        el.remove();
        console.log(`[Launcher] Removed Bonk.io ad container: #${id}`);
      }
    });

    document.querySelectorAll(adSelectors.join(',')).forEach(el => {
      if (el.id === 'maingameframe' || el.closest('#maingameframe')) return;
      el.remove();
    });
  };

  const observer = new MutationObserver(remove);
  observer.observe(document.body, { childList: true, subtree: true });
  setInterval(remove, 800);
  remove();

  console.log('[Launcher] Ad removal in aggressive mode.');
})();
