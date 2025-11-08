export function removeAds() {
  const remove = () => {
    const bonkAdIds = ['bonk_d_1', 'bonk_d_2'];

    const adSelectors = [
      'iframe[id^="google_ads_iframe_"]',
      'div[id^="google_ads_iframe_"]',
      'div[id*="gpt"]',
      'div[id*="lngtd"]',
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

      const parent = el.parentElement;
      if (parent && parent.childElementCount === 1 && parent.tagName !== 'BODY') {
        parent.remove();
      } else {
        el.remove();
      }
    });

    document.querySelectorAll('div').forEach(div => {
      if (div.closest('#maingameframe')) return;

      const id = div.id?.toLowerCase() || '';
      const cls = div.className?.toLowerCase() || '';

      if (
        id.startsWith('bonk_d_') ||
        id.includes('ads') ||
        id.includes('google_ads') ||
        id.includes('lngtd') ||
        cls.includes('ads') ||
        cls.includes('ad-container')
      ) {
        div.remove();
      }
    });
  };

  const observer = new MutationObserver(remove);
  observer.observe(document.body, { childList: true, subtree: true });

  setInterval(remove, 800);

  remove();

  console.log('[Launcher] Bonk.io ad cleaner (full aggressive mode) initialized.');
}
