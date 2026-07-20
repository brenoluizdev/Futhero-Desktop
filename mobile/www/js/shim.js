// Shim injetado dentro da InAppBrowser (bonk.io / haxball.com) para emular
// a API "futheroLauncherAPI" que os scripts de mod (portados do launcher desktop)
// esperam encontrar via contextBridge no Electron.
//
// Diferente do Electron, aqui roda tudo dentro da própria página do jogo,
// então funcionalidades que dependiam do processo nativo (setFrameRate via CDP,
// janelas extras) foram reimplementadas em JS puro ou viram no-op documentado.
(function () {
  if (window.futheroLauncherAPI) return;

  var FPS_KEY = "futhero_fps_config";

  function readFpsConfig() {
    try {
      var raw = localStorage.getItem(FPS_KEY);
      if (!raw) return { unlimitedFPS: false, fpsLimit: null };
      var parsed = JSON.parse(raw);
      return {
        unlimitedFPS: !!parsed.unlimitedFPS,
        fpsLimit: typeof parsed.fpsLimit === "number" ? parsed.fpsLimit : null,
      };
    } catch (e) {
      return { unlimitedFPS: false, fpsLimit: null };
    }
  }

  function writeFpsConfig(cfg) {
    try {
      localStorage.setItem(FPS_KEY, JSON.stringify(cfg));
    } catch (e) {
      console.error("[Futhero Shim] Falha ao salvar config de FPS:", e);
    }
  }

  function showToast(message) {
    try {
      var el = document.createElement("div");
      el.textContent = String(message).substring(0, 500);
      el.style.cssText =
        "position:fixed;top:20px;right:20px;background:#333;color:#fff;padding:15px;" +
        "border-radius:5px;z-index:2147483647;font-family:sans-serif;font-size:14px;" +
        "max-width:80vw;box-shadow:0 4px 12px rgba(0,0,0,.4)";
      document.body.appendChild(el);
      setTimeout(function () {
        el.remove();
      }, 3000);
    } catch (e) {
      console.log("[Futhero]", message);
    }
  }

  var api = {
    sendNotification: function (message) {
      showToast(message);
    },

    log: function (message) {
      console.log("[Futhero] " + message);
    },

    getCurrentUrl: function () {
      return window.location.href;
    },

    // --- FPS: aplicado via override de requestAnimationFrame (ver fps-limiter.js),
    // não existe equivalente ao webContents.setFrameRate do Chromium no WebView Android.
    getFpsConfig: function () {
      var cfg = readFpsConfig();
      var isDefault = !cfg.unlimitedFPS && cfg.fpsLimit === null;
      return Promise.resolve({
        unlimitedFPS: cfg.unlimitedFPS,
        fpsLimit: cfg.fpsLimit,
        isDefault: isDefault,
      });
    },

    getFpsLimit: function () {
      return Promise.resolve(readFpsConfig().fpsLimit);
    },

    isUnlockedFps: function () {
      return Promise.resolve(readFpsConfig().unlimitedFPS);
    },

    toggleUnlimitedFPS: function () {
      var cfg = readFpsConfig();
      var next = !cfg.unlimitedFPS;
      writeFpsConfig({ unlimitedFPS: next, fpsLimit: next ? null : cfg.fpsLimit });
      showToast(next ? "FPS ilimitado ativado. Recarregando..." : "FPS ilimitado desativado. Recarregando...");
      setTimeout(function () {
        window.location.reload();
      }, 800);
      return Promise.resolve(next);
    },

    setFpsLimit: function (limit) {
      if (limit !== null && (typeof limit !== "number" || limit < 30 || limit > 1000)) {
        return Promise.resolve(false);
      }
      writeFpsConfig({ unlimitedFPS: false, fpsLimit: limit });
      showToast(limit ? "Limite de FPS definido: " + limit : "FPS padrão restaurado. Recarregando...");
      setTimeout(function () {
        window.location.reload();
      }, 800);
      return Promise.resolve(true);
    },

    setFrameRate: function () {
      // Sem equivalente no WebView Android (era usado apenas como reforço visual no Electron).
      return Promise.resolve();
    },

    // --- Fullscreen: aplicado diretamente no elemento, sem round-trip nativo.
    fullscreenElement: function (selector) {
      try {
        var iframe = document.getElementById("maingameframe");
        var doc = iframe && iframe.contentWindow ? iframe.contentWindow.document : document;
        var element = doc.querySelector(selector) || document.querySelector(selector);

        if (!element) return Promise.resolve({ success: false, error: "element_not_found" });

        var req =
          element.requestFullscreen ||
          element.webkitRequestFullscreen ||
          element.mozRequestFullScreen ||
          element.msRequestFullscreen;

        if (!req) return Promise.resolve({ success: false, error: "fullscreen_not_supported" });
        req.call(element);
        return Promise.resolve({ success: true });
      } catch (e) {
        return Promise.resolve({ success: false, error: String(e) });
      }
    },

    exitFullscreen: function () {
      try {
        if (document.exitFullscreen) document.exitFullscreen();
        else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
        else if (document.mozCancelFullScreen) document.mozCancelFullScreen();
        else if (document.msExitFullscreen) document.msExitFullscreen();
        return Promise.resolve({ success: true });
      } catch (e) {
        return Promise.resolve({ success: false, error: String(e) });
      }
    },

    // --- Join room: sem janela nativa própria, usa prompt() do WebView (suportado
    // pela InAppBrowser) e navega a própria página para o link informado.
    openJoinWindow: function () {
      var link = window.prompt("Cole o link da sala do Bonk.io:");
      if (link) api.joinRoom(link);
    },

    joinRoom: function (link) {
      if (!link || typeof link !== "string") return;
      try {
        var parsed = new URL(link, window.location.href);
        if (["http:", "https:"].indexOf(parsed.protocol) === -1) return;
        window.location.href = parsed.toString();
      } catch (e) {
        console.error("[Futhero Shim] Link inválido:", link);
      }
    },

    openExternal: function (url) {
      try {
        window.open(url, "_system");
      } catch (e) {
        window.open(url, "_blank");
      }
    },

    // --- Recursos exclusivos do desktop, mantidos como no-op documentado
    // para não quebrar os scripts portados que os chamam.
    closeWindow: function () {
      console.log("[Futhero Shim] closeWindow não suportado no mobile — feche pela barra do navegador.");
    },

    switchGame: function () {
      console.log("[Futhero Shim] switchGame não suportado dentro do jogo — volte ao seletor.");
    },

    startAuth: function () {
      console.log("[Futhero Shim] Auth desabilitado na versão mobile.");
    },
    checkAuth: function () {
      return Promise.resolve(true);
    },
    logout: function () {
      return Promise.resolve(true);
    },
    onAuthSuccess: function () {},
    onLaunchError: function () {},
  };

  window.futheroLauncherAPI = api;
  console.log("[Futhero Shim] futheroLauncherAPI (mobile) inicializado.");
})();
