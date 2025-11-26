(() => {
  console.log("[Launcher] Bonk.io ad cleaner initialized.");
  
  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("iframe").forEach((iframe) => {
      const id = iframe.id || "";

      if (id === "maingameframe") return;
      if (iframe.src.includes("gameframe-release")) return;

      const adKeywords = [
        "ads",
        "adserver",
        "doubleclick",
        "pubmatic",
        "adnxs",
        "googlesyndication",
      ];

      if (adKeywords.some((k) => iframe.src.includes(k))) {
        iframe.remove();
      }
    });

    const adSelectors = [
      "#adboxverticalleftCurse",
      "#adboxverticalrightCurse",
      "#bonk_d_1",
      "#bonk_d_2",
      "#adboxverticalCurse",
      "#adboxverticalleftCurse",
      ".lngtd-ad-wrapper-banner",
      ".lngtd-dynamic-ad-container",
    ];

    adSelectors.forEach((sel) => {
      document.querySelectorAll(sel).forEach((el) => el.remove());
    });
  });
})();
