(function () {
  "use strict";

  var GAME_URLS = {
    BONKIO: "https://bonk.io",
    HAXBALL: "https://www.haxball.com/play",
  };

  var loading = document.getElementById("loading");
  var loadingGameName = document.getElementById("loadingGameName");
  var gamesGrid = document.getElementById("gamesGrid");

  var scriptCache = {}; // path -> texto do script já buscado
  var manifestPromise = fetch("scripts/manifest.json").then(function (r) {
    return r.json();
  });
  var shimPromise = fetch("js/shim.js").then(function (r) {
    return r.text();
  });

  function fetchScript(path) {
    if (scriptCache[path]) return Promise.resolve(scriptCache[path]);
    return fetch(path)
      .then(function (r) {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.text();
      })
      .then(function (text) {
        scriptCache[path] = text;
        return text;
      })
      .catch(function (err) {
        console.error("[Futhero] Falha ao carregar script", path, err);
        return "";
      });
  }

  function injectAllScripts(iab, gameId) {
    Promise.all([manifestPromise, shimPromise]).then(function (results) {
      var manifest = results[0];
      var shimCode = results[1];
      var paths = manifest[gameId] || [];

      iab.executeScript({ code: shimCode });

      var chain = Promise.resolve();
      paths.forEach(function (path) {
        chain = chain.then(function () {
          return fetchScript(path).then(function (code) {
            if (!code) return;
            iab.executeScript({ code: code });
            console.log("[Futhero] Injetado:", path);
          });
        });
      });
    });
  }

  function openGame(game) {
    var url = GAME_URLS[game.id] || game.url;
    if (!url) {
      alert("URL do jogo não configurada: " + game.id);
      return;
    }

    loadingGameName.textContent = game.name;
    loading.classList.add("active");

    var iab = cordova.InAppBrowser.open(
      url,
      "_blank",
      "location=yes,toolbar=yes,zoom=no,hidenavigationbuttons=no,hideurlbar=no,allowInlineMediaPlayback=yes,mediaPlaybackRequiresUserAction=no"
    );

    var targetHost = safeHostname(url);
    var mainLoaded = false;

    iab.addEventListener("loadstart", function () {
      loading.classList.add("active");
    });

    iab.addEventListener("loadstop", function () {
      loading.classList.remove("active");
      mainLoaded = true;
      // Pequeno atraso para dar tempo do jogo montar seu próprio DOM inicial,
      // mesma estratégia usada na versão desktop (BaseGameHandler.injectScripts).
      setTimeout(function () {
        injectAllScripts(iab, game.id);
      }, 1500);
    });

    iab.addEventListener("loaderror", function (event) {
      // O InAppBrowser dispara "loaderror" para QUALQUER sub-recurso que falhe
      // dentro da página (iframes de anúncio, trackers de terceiros, etc — os
      // mesmos que removeAds.js remove), não só para a navegação principal.
      // Só tratamos como falha real se for a própria página do jogo E ela
      // ainda não tiver carregado com sucesso.
      var failedHost = safeHostname(event && event.url);
      var isMainFrame = !mainLoaded && failedHost && failedHost === targetHost;

      if (!isMainFrame) {
        console.warn("[Futhero] Falha em sub-recurso (ignorado):", event && event.url, event && event.message);
        return;
      }

      loading.classList.remove("active");
      console.error("[Futhero] Erro ao carregar jogo:", event);
      alert("Erro ao carregar o jogo: " + (event && event.message ? event.message : "desconhecido"));
    });

    iab.addEventListener("exit", function () {
      loading.classList.remove("active");
    });
  }

  function safeHostname(url) {
    try {
      return new URL(url).hostname;
    } catch (e) {
      return null;
    }
  }

  function openExternalLink(url) {
    if (window.cordova && cordova.InAppBrowser) {
      cordova.InAppBrowser.open(url, "_system");
    } else {
      window.open(url, "_blank");
    }
  }

  function renderGames(config) {
    gamesGrid.innerHTML = "";

    config.games.forEach(function (game) {
      var card = document.createElement("div");
      card.className = "game-card";
      card.style.setProperty("--card-color", game.color);
      card.style.setProperty("--card-color-alt", game.colorAlt || game.color);

      card.innerHTML =
        '<div class="game-card-content">' +
        '<div class="feature-badge"><div class="badge-dot"></div><span>Disponível</span></div>' +
        '<span class="game-icon">' + game.icon + "</span>" +
        '<h2 class="game-name">' + game.name + "</h2>" +
        '<p class="game-description">' + game.description + "</p>" +
        '<button class="play-button"><span class="play-icon">▶</span><span>Jogar Agora</span></button>' +
        "</div>";

      card.addEventListener("click", function () {
        openGame(game);
      });

      gamesGrid.appendChild(card);
    });
  }

  function loadGames() {
    fetch("configs/config-games.json")
      .then(function (r) {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.json();
      })
      .then(renderGames)
      .catch(function (error) {
        console.error("Erro ao carregar jogos:", error);
        gamesGrid.innerHTML =
          '<div style="grid-column: 1 / -1; text-align: center; color: rgba(255,255,255,0.7); padding: 40px; background: rgba(249, 115, 22, 0.1); border: 1px solid rgba(249, 115, 22, 0.3); border-radius: 24px;">' +
          '<div style="font-size: 40px; margin-bottom: 16px;">❌</div>' +
          "<h2>Erro ao carregar jogos</h2>" +
          '<p style="color: rgba(255,255,255,0.5);">Verifique o arquivo configs/config-games.json.</p>' +
          "</div>";
      });
  }

  document.addEventListener("deviceready", loadGames, false);
  // Fallback caso o evento deviceready não dispare (ex: teste em navegador desktop)
  if (!window.cordova) {
    document.addEventListener("DOMContentLoaded", loadGames);
  }

  document.getElementById("linkGithub").addEventListener("click", function (e) {
    e.preventDefault();
    openExternalLink("https://github.com/brenoluizdev/Futhero-Desktop");
  });
  document.getElementById("linkDiscord").addEventListener("click", function (e) {
    e.preventDefault();
    openExternalLink("https://discord.gg/qRJ4UCMfja");
  });
  document.getElementById("linkBug").addEventListener("click", function (e) {
    e.preventDefault();
    openExternalLink("https://github.com/brenoluizdev/Futhero-Desktop/issues/new");
  });
})();
