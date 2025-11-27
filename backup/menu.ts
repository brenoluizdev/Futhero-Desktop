(() => {
  console.log("[Launcher] UI Menu injected.");

  const style = document.createElement("link");
  style.rel = "stylesheet";
  style.href = "app://scripts/shared/ui/menu.css";
  document.head.appendChild(style);

  const menuButton = document.createElement("div");
  menuButton.id = "fh-menu-button";
  menuButton.innerHTML = `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
    </svg>
  `;
  menuButton.style.cssText = `
    position: fixed;
    bottom: 24px;
    right: 24px;
    width: 56px;
    height: 56px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    z-index: 999998;
    box-shadow: 0 4px 20px rgba(102, 126, 234, 0.4);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  `;

  menuButton.addEventListener("mouseenter", () => {
    menuButton.style.transform = "scale(1.1) rotate(90deg)";
    menuButton.style.boxShadow = "0 8px 30px rgba(102, 126, 234, 0.6)";
  });

  menuButton.addEventListener("mouseleave", () => {
    menuButton.style.transform = "scale(1) rotate(0deg)";
    menuButton.style.boxShadow = "0 4px 20px rgba(102, 126, 234, 0.4)";
  });

  document.body.appendChild(menuButton);

  function createMainMenu() {
    const overlay = document.createElement("div");
    overlay.id = "fh-menu-overlay";
    overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.85);
    z-index: 2147483646;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.2s ease;
  `;

    const modal = document.createElement("div");
    modal.style.cssText = `
      background: #36393f;
      border-radius: 8px;
      width: 90%;
      max-width: 1000px;
      height: 85vh;
      max-height: 720px;
      display: flex;
      overflow: hidden;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
      transform: scale(0.9);
      transition: transform 0.2s ease;
    `;

    const sidebar = document.createElement("div");
    sidebar.style.cssText = `
      width: 240px;
      background: #2f3136;
      padding: 60px 8px 20px 8px;
      display: flex;
      flex-direction: column;
      gap: 2px;
      overflow-y: auto;
    `;

    const content = document.createElement("div");
    content.id = "fh-menu-content";
    content.style.cssText = `
      flex: 1;
      background: #36393f;
      padding: 60px 40px 20px 40px;
      overflow-y: auto;
      position: relative;
    `;

    const closeBtn = document.createElement("button");
    closeBtn.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.4 4L12 10.4L5.6 4L4 5.6L10.4 12L4 18.4L5.6 20L12 13.6L18.4 20L20 18.4L13.6 12L20 5.6L18.4 4Z"/>
      </svg>
    `;
    closeBtn.style.cssText = `
      position: absolute;
      top: 16px;
      right: 16px;
      width: 36px;
      height: 36px;
      border: none;
      background: transparent;
      color: #b9bbbe;
      cursor: pointer;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.15s ease;
      z-index: 10;
    `;

    closeBtn.addEventListener("mouseenter", () => {
      closeBtn.style.background = "#f04747";
      closeBtn.style.color = "white";
    });

    closeBtn.addEventListener("mouseleave", () => {
      closeBtn.style.background = "transparent";
      closeBtn.style.color = "#b9bbbe";
    });

    closeBtn.addEventListener("click", () => {
      overlay.style.opacity = "0";
      modal.style.transform = "scale(0.9)";
      setTimeout(() => overlay.remove(), 200);
    });

    const pages = {
      home: createHomePage(),
      game: createGamePage(),
      performance: createPerformancePage(),
      discord: createDiscordPage(),
      settings: createSettingsPage(),
    };

    const menuItems = [
      { id: "home", icon: "🏠", label: "Início", page: pages.home },
      { id: "game", icon: "🎮", label: "Jogos", page: pages.game },
      {
        id: "performance",
        icon: "⚡",
        label: "Performance",
        page: pages.performance,
      },
      { id: "discord", icon: "💬", label: "Discord", page: pages.discord },
      {
        id: "settings",
        icon: "⚙️",
        label: "Configurações",
        page: pages.settings,
      },
    ];

    menuItems.forEach((item, index) => {
      const btn = document.createElement("div");
      btn.style.cssText = `
        padding: 10px 12px;
        border-radius: 4px;
        color: ${index === 0 ? "#fff" : "#96989d"};
        background: ${index === 0 ? "#404249" : "transparent"};
        cursor: pointer;
        font-family: 'Segoe UI', Arial, sans-serif;
        font-size: 16px;
        font-weight: 500;
        display: flex;
        align-items: center;
        gap: 12px;
        transition: all 0.15s ease;
        user-select: none;
      `;

      btn.innerHTML = `<span style="font-size: 20px;">${item.icon}</span> ${item.label}`;

      btn.addEventListener("mouseenter", () => {
        if (btn.style.background !== "rgb(64, 66, 73)") {
          btn.style.background = "#393c43";
          btn.style.color = "#dcddde";
        }
      });

      btn.addEventListener("mouseleave", () => {
        if (btn.style.background !== "rgb(64, 66, 73)") {
          btn.style.background = "transparent";
          btn.style.color = "#96989d";
        }
      });

      btn.addEventListener("click", () => {
        sidebar.querySelectorAll("div").forEach((el) => {
          (el as HTMLElement).style.background = "transparent";
          (el as HTMLElement).style.color = "#96989d";
        });

        btn.style.background = "#404249";
        btn.style.color = "#fff";

        content.innerHTML = "";
        content.appendChild(closeBtn);
        content.appendChild(item.page);
      });

      sidebar.appendChild(btn);
    });

    content.appendChild(closeBtn);
    content.appendChild(pages.home);

    modal.appendChild(sidebar);
    modal.appendChild(content);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    setTimeout(() => {
      overlay.style.opacity = "1";
      modal.style.transform = "scale(1)";
    }, 10);

    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) {
        overlay.style.opacity = "0";
        modal.style.transform = "scale(0.9)";
        setTimeout(() => overlay.remove(), 200);
      }
    });
  }

  function createHomePage() {
    const page = document.createElement("div");

    page.innerHTML = `
    <div style="
      background: #202225;
      padding: 24px;
      border-radius: 12px;
      border: 1px solid #2f3136;
      box-shadow: 0 0 12px rgba(0,0,0,0.3);
      position: relative;
    ">
      <!-- Botão de Fullscreen -->
      <button id="fullscreen-btn"
        style="
          position: absolute;
          top: 16px;
          right: 120px;
          background: #5865f2;
          border: none;
          color: white;
          padding: 8px 14px;
          border-radius: 6px;
          font-family: 'Segoe UI', Arial, sans-serif;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: 0.2s;
        ">
        ⛶ Fullscreen
      </button>

      <button id="test-notification-btn"
        style="
          position: absolute;
          top: 16px;
          right: 16px;
          background: #43b581;
          border: none;
          color: white;
          padding: 8px 14px;
          border-radius: 6px;
          font-family: 'Segoe UI', Arial, sans-serif;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: 0.2s;
        ">
        🔔 Testar
      </button>

      <h1 style="color: #fff; font-family: 'Segoe UI', Arial, sans-serif; font-size: 24px; font-weight: 600; margin: 0 0 8px 0;">
        Bem-vindo ao Futhero Launcher
      </h1>
      <p style="color: #b9bbbe; font-family: 'Segoe UI', Arial, sans-serif; font-size: 14px; margin: 0 0 32px 0;">
        Sua plataforma completa para Bonk.io e Haxball
      </p>
      
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px; margin-top: 24px;">
        <div style="background: #2f3136; padding: 24px; border-radius: 8px; border-left: 4px solid #667eea;">
          <h3 style="color: #fff; font-family: 'Segoe UI', Arial, sans-serif; font-size: 18px; margin: 0 0 12px 0;">
            🎮 Jogos Suportados
          </h3>
          <p style="color: #b9bbbe; font-family: 'Segoe UI', Arial, sans-serif; font-size: 14px; margin: 0; line-height: 1.5;">
            Bonk.io e Haxball totalmente integrados com recursos exclusivos
          </p>
        </div>

        <div style="background: #2f3136; padding: 24px; border-radius: 8px; border-left: 4px solid #5865f2;">
          <h3 style="color: #fff; font-family: 'Segoe UI', Arial, sans-serif; font-size: 18px; margin: 0 0 12px 0;">
            💬 Comunidade Ativa
          </h3>
          <p style="color: #b9bbbe; font-family: 'Segoe UI', Arial, sans-serif; font-size: 14px; margin: 0; line-height: 1.5;">
            Junte-se ao nosso Discord e conecte-se com outros jogadores
          </p>
        </div>
      </div>
    </div>
  `;

    setTimeout(() => {
      const btn = page.querySelector("#fullscreen-btn") as HTMLButtonElement;
      const testNotifBtn = page.querySelector("#test-notification-btn") as HTMLButtonElement;

      if (!btn) return;

      let fullscreen = false;

      document.addEventListener('fullscreenchange', () => {
        if (!document.fullscreenElement) {
          fullscreen = false;
          btn.textContent = "⛶ Fullscreen";
        }
      });

      btn.addEventListener("click", async () => {
        try {
          if (!fullscreen) {
            const result = await (window as any).futheroLauncherAPI.fullscreenElement("#bonkiocontainer");

            console.log('[Fullscreen] Resultado recebido:', result);

            if (result && result.success) {
              fullscreen = true;
              btn.textContent = "🗗 Sair do Fullscreen";

              (window as any).futheroLauncherAPI.sendNotification("Modo Fullscreen ativado! Pressione ESC para sair.");
            } else {
              console.error('[Fullscreen] Falha ao aplicar fullscreen:', result?.error);
              (window as any).futheroLauncherAPI.sendNotification("❌ Erro ao ativar fullscreen");
            }
          } else {
            await (window as any).futheroLauncherAPI.exitFullscreen();
            fullscreen = false;
            btn.textContent = "⛶ Fullscreen";
          }
        } catch (error) {
          console.error('[Fullscreen] Erro:', error);
          (window as any).futheroLauncherAPI.sendNotification("❌ Erro ao ativar fullscreen");
        }
      });

      if (testNotifBtn) {
        testNotifBtn.addEventListener("click", () => {
          const messages = [
            "✅ Sistema funcionando perfeitamente!",
            "🎮 Bem-vindo ao Futhero Launcher!",
            "⚡ Performance otimizada!",
            "💬 Junte-se ao nosso Discord!"
          ];

          const randomMessage = messages[Math.floor(Math.random() * messages.length)];
          (window as any).futheroLauncherAPI.sendNotification(randomMessage);
        });

        testNotifBtn.addEventListener("mouseenter", () => {
          testNotifBtn.style.background = "#3ba55d";
        });

        testNotifBtn.addEventListener("mouseleave", () => {
          testNotifBtn.style.background = "#43b581";
        });
      }

      btn.addEventListener("mouseenter", () => {
        btn.style.background = "#4752c4";
        btn.style.transform = "scale(1.05)";
      });

      btn.addEventListener("mouseleave", () => {
        btn.style.background = "#5865f2";
        btn.style.transform = "scale(1)";
      });
    }, 30);

    return page;
  }


  function createGamePage() {
    const page = document.createElement("div");
    const currentUrl = window.location.href;
    const isHaxball = currentUrl.includes("haxball.com");
    const isBonk = currentUrl.includes("bonk.io");

    page.innerHTML = `
      <h1 style="color: #fff; font-family: 'Segoe UI', Arial, sans-serif; font-size: 24px; font-weight: 600; margin: 0 0 8px 0;">
        Gerenciar Jogos
      </h1>
      <p style="color: #b9bbbe; font-family: 'Segoe UI', Arial, sans-serif; font-size: 14px; margin: 0 0 32px 0;">
        Você está jogando: <span style="color: #667eea; font-weight: 600;">${isHaxball ? "Haxball" : isBonk ? "Bonk.io" : "Nenhum"
      }</span>
      </p>
      
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 32px; border-radius: 12px; position: relative; overflow: hidden;">
          <div style="position: absolute; top: 0; right: 0; width: 100px; height: 100px; background: rgba(255,255,255,0.1); border-radius: 50%; transform: translate(30%, -30%);"></div>
          <h3 style="color: #fff; font-family: 'Segoe UI', Arial, sans-serif; font-size: 22px; margin: 0 0 12px 0; position: relative; z-index: 1;">
            🏐 Bonk.io
          </h3>
          <p style="color: rgba(255,255,255,0.9); font-family: 'Segoe UI', Arial, sans-serif; font-size: 14px; margin: 0 0 20px 0; line-height: 1.6; position: relative; z-index: 1;">
            Jogo multiplayer de física com mapas personalizados
          </p>
          <button id="switch-bonk" style="
            background: rgba(255,255,255,0.2);
            border: 1px solid rgba(255,255,255,0.3);
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            cursor: pointer;
            font-family: 'Segoe UI', Arial, sans-serif;
            font-size: 14px;
            font-weight: 600;
            position: relative;
            z-index: 1;
            transition: all 0.2s;
          ">
            ${isBonk ? "✓ Jogando Agora" : "Jogar Bonk.io"}
          </button>
        </div>
        
        <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 32px; border-radius: 12px; position: relative; overflow: hidden;">
          <div style="position: absolute; top: 0; right: 0; width: 100px; height: 100px; background: rgba(255,255,255,0.1); border-radius: 50%; transform: translate(30%, -30%);"></div>
          <h3 style="color: #fff; font-family: 'Segoe UI', Arial, sans-serif; font-size: 22px; margin: 0 0 12px 0; position: relative; z-index: 1;">
            ⚽ Haxball
          </h3>
          <p style="color: rgba(255,255,255,0.9); font-family: 'Segoe UI', Arial, sans-serif; font-size: 14px; margin: 0 0 20px 0; line-height: 1.6; position: relative; z-index: 1;">
            Futebol multiplayer online com física realista
          </p>
          <button id="switch-haxball" style="
            background: rgba(255,255,255,0.2);
            border: 1px solid rgba(255,255,255,0.3);
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            cursor: pointer;
            font-family: 'Segoe UI', Arial, sans-serif;
            font-size: 14px;
            font-weight: 600;
            position: relative;
            z-index: 1;
            transition: all 0.2s;
          ">
            ${isHaxball ? "✓ Jogando Agora" : "Jogar Haxball"}
          </button>
        </div>
      </div>
      
      <div style="margin-top: 24px; background: #2f3136; padding: 20px; border-radius: 8px;">
        <button id="reload-game" style="
          background: #5865f2;
          border: none;
          color: white;
          padding: 12px 24px;
          border-radius: 8px;
          cursor: pointer;
          font-family: 'Segoe UI', Arial, sans-serif;
          font-size: 14px;
          font-weight: 600;
          transition: all 0.2s;
        ">
          🔄 Recarregar Jogo Atual
        </button>
      </div>
    `;

    setTimeout(() => {
      const bonkBtn = page.querySelector("#switch-bonk");
      const haxballBtn = page.querySelector("#switch-haxball");
      const reloadBtn = page.querySelector("#reload-game");

      bonkBtn?.addEventListener("click", () => {
        if (!isBonk) window.location.href = "https://bonk.io/";
      });

      haxballBtn?.addEventListener("click", () => {
        if (!isHaxball) window.location.href = "https://www.haxball.com/";
      });

      reloadBtn?.addEventListener("click", () => {
        location.reload();
      });
    }, 0);

    return page;
  }

  function createPerformancePage() {
    const page = document.createElement("div");

    const settings = {
      unlockFPS: localStorage.getItem("fh_unlock_fps") === "true",
      hardwareAccel: localStorage.getItem("fh_hardware_accel") === "true",
      lowLatency: localStorage.getItem("fh_low_latency") === "true",
      disableAnimations:
        localStorage.getItem("fh_disable_animations") === "true",
      prioritizePerformance:
        localStorage.getItem("fh_prioritize_perf") === "true",
    };

    page.innerHTML = `
    <h1 style="color: #fff; font-family: 'Segoe UI', Arial, sans-serif; font-size: 24px; font-weight: 600; margin: 0 0 8px 0;">
      ⚡ Performance & Otimização
    </h1>
    <p style="color: #b9bbbe; font-family: 'Segoe UI', Arial, sans-serif; font-size: 14px; margin: 0 0 32px 0;">
      Configure opções avançadas para melhorar o desempenho nos jogos
    </p>
    
    <div style="background: #2f3136; padding: 24px; border-radius: 8px; margin-bottom: 16px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
        <div>
          <h3 style="color: #fff; font-family: 'Segoe UI', Arial, sans-serif; font-size: 18px; margin: 0 0 8px 0;">
            🚀 Destravar Limite de FPS
          </h3>
          <p style="color: #b9bbbe; font-family: 'Segoe UI', Arial, sans-serif; font-size: 14px; margin: 0; line-height: 1.6;">
            Remove o limite de 60 FPS do navegador, permitindo taxas de quadros mais altas
          </p>
        </div>
        <label class="fh-toggle">
          <input type="checkbox" id="toggle-fps" ${settings.unlockFPS ? "checked" : ""
      }>
          <span class="fh-toggle-slider"></span>
        </label>
      </div>
    </div>

    <div style="background: #2f3136; padding: 24px; border-radius: 8px; margin-bottom: 16px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
        <div>
          <h3 style="color: #fff; font-family: 'Segoe UI', Arial, sans-serif; font-size: 18px; margin: 0 0 8px 0;">
            🎮 Aceleração de Hardware
          </h3>
          <p style="color: #b9bbbe; font-family: 'Segoe UI', Arial, sans-serif; font-size: 14px; margin: 0; line-height: 1.6;">
            Usa a GPU para renderização, melhorando significativamente a performance
          </p>
        </div>
        <label class="fh-toggle">
          <input type="checkbox" id="toggle-hardware" ${settings.hardwareAccel ? "checked" : ""
      }>
          <span class="fh-toggle-slider"></span>
        </label>
      </div>
    </div>

    <div style="background: #2f3136; padding: 24px; border-radius: 8px; margin-bottom: 16px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
        <div>
          <h3 style="color: #fff; font-family: 'Segoe UI', Arial, sans-serif; font-size: 18px; margin: 0 0 8px 0;">
            ⚡ Modo Baixa Latência
          </h3>
          <p style="color: #b9bbbe; font-family: 'Segoe UI', Arial, sans-serif; font-size: 14px; margin: 0; line-height: 1.6;">
            Reduz o input lag e melhora a responsividade dos controles
          </p>
        </div>
        <label class="fh-toggle">
          <input type="checkbox" id="toggle-latency" ${settings.lowLatency ? "checked" : ""
      }>
          <span class="fh-toggle-slider"></span>
        </label>
      </div>
    </div>

    <div style="background: #2f3136; padding: 24px; border-radius: 8px; margin-bottom: 16px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
        <div>
          <h3 style="color: #fff; font-family: 'Segoe UI', Arial, sans-serif; font-size: 18px; margin: 0 0 8px 0;">
            🎯 Desativar Animações Desnecessárias
          </h3>
          <p style="color: #b9bbbe; font-family: 'Segoe UI', Arial, sans-serif; font-size: 14px; margin: 0; line-height: 1.6;">
            Remove efeitos visuais e animações decorativas para ganho de FPS
          </p>
        </div>
        <label class="fh-toggle">
          <input type="checkbox" id="toggle-animations" ${settings.disableAnimations ? "checked" : ""
      }>
          <span class="fh-toggle-slider"></span>
        </label>
      </div>
    </div>

    <div style="background: #2f3136; padding: 24px; border-radius: 8px; margin-bottom: 16px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
        <div>
          <h3 style="color: #fff; font-family: 'Segoe UI', Arial, sans-serif; font-size: 18px; margin: 0 0 8px 0;">
            🔥 Priorizar Performance Total
          </h3>
          <p style="color: #b9bbbe; font-family: 'Segoe UI', Arial, sans-serif; font-size: 14px; margin: 0; line-height: 1.6;">
            Aplica todas as otimizações disponíveis (recomendado para PCs mais fracos)
          </p>
        </div>
        <label class="fh-toggle">
          <input type="checkbox" id="toggle-priority" ${settings.prioritizePerformance ? "checked" : ""
      }>
          <span class="fh-toggle-slider"></span>
        </label>
      </div>
    </div>

    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 8px; margin-top: 24px;">
      <h4 style="color: #fff; font-family: 'Segoe UI', Arial, sans-serif; font-size: 16px; margin: 0 0 12px 0;">
        ℹ️ Informações do Sistema
      </h4>
      <div id="system-info" style="color: rgba(255,255,255,0.9); font-family: 'Segoe UI', Arial, sans-serif; font-size: 13px; line-height: 1.8;">
        <div>🖥️ Núcleos: ${navigator.hardwareConcurrency || "N/A"}</div>
        <div>💾 Memória: ${(navigator as any).deviceMemory
        ? (navigator as any).deviceMemory + " GB"
        : "N/A"
      }</div>
        <div>🌐 Conexão: ${(navigator as any).connection?.effectiveType || "N/A"
      }</div>
      </div>
    </div>

    <div style="margin-top: 24px; text-align: center;">
      <button id="apply-performance" style="
        background: #43b581;
        border: none;
        color: white;
        padding: 14px 32px;
        border-radius: 8px;
        cursor: pointer;
        font-family: 'Segoe UI', Arial, sans-serif;
        font-size: 15px;
        font-weight: 600;
        transition: all 0.2s;
        box-shadow: 0 4px 12px rgba(67, 181, 129, 0.4);
      ">
        ✓ Aplicar e Recarregar
      </button>
    </div>
  `;

    const toggleStyle = document.createElement("style");
    toggleStyle.textContent = `
    .fh-toggle {
      position: relative;
      display: inline-block;
      width: 50px;
      height: 26px;
      flex-shrink: 0;
    }

    .fh-toggle input {
      opacity: 0;
      width: 0;
      height: 0;
    }

    .fh-toggle-slider {
      position: absolute;
      cursor: pointer;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: #72767d;
      transition: 0.3s;
      border-radius: 34px;
    }

    .fh-toggle-slider:before {
      position: absolute;
      content: "";
      height: 20px;
      width: 20px;
      left: 3px;
      bottom: 3px;
      background-color: white;
      transition: 0.3s;
      border-radius: 50%;
    }

    .fh-toggle input:checked + .fh-toggle-slider {
      background-color: #43b581;
    }

    .fh-toggle input:checked + .fh-toggle-slider:before {
      transform: translateX(24px);
    }

    .fh-toggle-slider:hover {
      box-shadow: 0 0 8px rgba(67, 181, 129, 0.4);
    }
  `;
    document.head.appendChild(toggleStyle);

    setTimeout(() => {
      const applyBtn = page.querySelector("#apply-performance");
      const toggleFPS = page.querySelector("#toggle-fps") as HTMLInputElement;
      const toggleHardware = page.querySelector(
        "#toggle-hardware"
      ) as HTMLInputElement;
      const toggleLatency = page.querySelector(
        "#toggle-latency"
      ) as HTMLInputElement;
      const toggleAnimations = page.querySelector(
        "#toggle-animations"
      ) as HTMLInputElement;
      const togglePriority = page.querySelector(
        "#toggle-priority"
      ) as HTMLInputElement;

      const saveSettings = () => {
        localStorage.setItem("fh_unlock_fps", toggleFPS.checked.toString());
        localStorage.setItem(
          "fh_hardware_accel",
          toggleHardware.checked.toString()
        );
        localStorage.setItem(
          "fh_low_latency",
          toggleLatency.checked.toString()
        );
        localStorage.setItem(
          "fh_disable_animations",
          toggleAnimations.checked.toString()
        );
        localStorage.setItem(
          "fh_prioritize_perf",
          togglePriority.checked.toString()
        );
      };

      toggleFPS?.addEventListener("change", saveSettings);
      toggleHardware?.addEventListener("change", saveSettings);
      toggleLatency?.addEventListener("change", saveSettings);
      toggleAnimations?.addEventListener("change", saveSettings);

      togglePriority?.addEventListener("change", (e) => {
        if ((e.target as HTMLInputElement).checked) {
          toggleFPS.checked = true;
          toggleHardware.checked = true;
          toggleLatency.checked = true;
          toggleAnimations.checked = true;
        }
        saveSettings();
      });

      applyBtn?.addEventListener("click", () => {
        applyPerformanceSettings();
        location.reload();
      });
    }, 0);

    return page;
  }

  function applyPerformanceSettings() {
    const settings = {
      unlockFPS: localStorage.getItem("fh_unlock_fps") === "true",
      hardwareAccel: localStorage.getItem("fh_hardware_accel") === "true",
      lowLatency: localStorage.getItem("fh_low_latency") === "true",
      disableAnimations:
        localStorage.getItem("fh_disable_animations") === "true",
      prioritizePerformance:
        localStorage.getItem("fh_prioritize_perf") === "true",
    };

    if (settings.unlockFPS) {
      try {
        const style = document.createElement("style");
        style.textContent = `
        * {
          image-rendering: -webkit-optimize-contrast !important;
          image-rendering: crisp-edges !important;
        }
        canvas {
          image-rendering: pixelated !important;
        }
      `;
        document.head.appendChild(style);

        console.log("[Futhero] FPS desbloqueado");
      } catch (e) {
        console.error("[Futhero] Erro ao desbloquear FPS:", e);
      }
    }

    if (settings.hardwareAccel) {
      try {
        const canvases = document.querySelectorAll("canvas");
        canvases.forEach((canvas) => {
          const ctx = canvas.getContext("2d", {
            alpha: false,
            desynchronized: true,
            willReadFrequently: false,
          });
        });
        console.log("[Futhero] Aceleração de hardware ativada");
      } catch (e) {
        console.error("[Futhero] Erro na aceleração de hardware:", e);
      }
    }

    if (settings.lowLatency) {
      try {
        document.addEventListener(
          "keydown",
          (e) => e.stopImmediatePropagation(),
          true
        );
        document.addEventListener(
          "keyup",
          (e) => e.stopImmediatePropagation(),
          true
        );
        document.addEventListener(
          "mousedown",
          (e) => e.stopImmediatePropagation(),
          true
        );
        document.addEventListener(
          "mouseup",
          (e) => e.stopImmediatePropagation(),
          true
        );
        console.log("[Futhero] Modo baixa latência ativado");
      } catch (e) {
        console.error("[Futhero] Erro no modo baixa latência:", e);
      }
    }

    if (settings.disableAnimations) {
      try {
        const style = document.createElement("style");
        style.textContent = `
        * {
          animation-duration: 0s !important;
          animation-delay: 0s !important;
          transition-duration: 0s !important;
          transition-delay: 0s !important;
        }
      `;
        document.head.appendChild(style);
        console.log("[Futhero] Animações desativadas");
      } catch (e) {
        console.error("[Futhero] Erro ao desativar animações:", e);
      }
    }
  }

  function createDiscordPage() {
    const page = document.createElement("div");
    page.innerHTML = `
      <h1 style="color: #fff; font-family: 'Segoe UI', Arial, sans-serif; font-size: 24px; font-weight: 600; margin: 0 0 8px 0;">
        💬 Junte-se ao Discord
      </h1>
      <p style="color: #b9bbbe; font-family: 'Segoe UI', Arial, sans-serif; font-size: 14px; margin: 0 0 32px 0;">
        Conecte-se com a comunidade Futhero
      </p>
      
      <div style="background: linear-gradient(135deg, #5865f2 0%, #7289da 100%); padding: 48px; border-radius: 12px; text-align: center;">
        <svg width="80" height="80" viewBox="0 0 24 24" fill="white" style="margin-bottom: 24px; filter: drop-shadow(0 4px 12px rgba(0,0,0,0.3));">
          <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
        </svg>
        
        <h2 style="color: white; font-family: 'Segoe UI', Arial, sans-serif; font-size: 28px; margin: 0 0 16px 0; font-weight: 600;">
          Comunidade Futhero
        </h2>
        <p style="color: rgba(255,255,255,0.9); font-family: 'Segoe UI', Arial, sans-serif; font-size: 16px; margin: 0 0 32px 0; line-height: 1.6;">
          Participe de eventos, conheça outros jogadores e fique por dentro das novidades
        </p>
        
        <div style="background: rgba(255, 255, 255, 0.15); border-radius: 8px; padding: 16px; margin: 0 auto 24px auto; max-width: 500px; backdrop-filter: blur(10px);">
          <input 
            type="text" 
            value="https://discord.gg/qRJ4UCMfja" 
            readonly
            id="discord-link"
            style="
              width: 100%;
              background: rgba(255, 255, 255, 0.2);
              border: 1px solid rgba(255, 255, 255, 0.3);
              border-radius: 6px;
              padding: 12px;
              color: white;
              font-family: 'Consolas', 'Courier New', monospace;
              font-size: 15px;
              text-align: center;
              outline: none;
              box-sizing: border-box;
            "
          />
        </div>
        
        <button id="copy-discord" style="
          background: rgba(255, 255, 255, 0.25);
          border: 1px solid rgba(255, 255, 255, 0.3);
          color: white;
          padding: 14px 32px;
          border-radius: 8px;
          cursor: pointer;
          font-family: 'Segoe UI', Arial, sans-serif;
          font-size: 16px;
          font-weight: 600;
          transition: all 0.2s;
          backdrop-filter: blur(10px);
        ">
          📋 Copiar Link do Discord
        </button>
      </div>
    `;

    setTimeout(() => {
      const copyBtn = page.querySelector("#copy-discord");
      const input = page.querySelector("#discord-link") as HTMLInputElement;

      copyBtn?.addEventListener("click", () => {
        input.select();
        input.setSelectionRange(0, 99999);

        try {
          document.execCommand("copy");
          (copyBtn as HTMLElement).textContent = "✓ Link Copiado!";
          (copyBtn as HTMLElement).style.background = "rgba(34, 197, 94, 0.8)";

          setTimeout(() => {
            (copyBtn as HTMLElement).textContent = "📋 Copiar Link do Discord";
            (copyBtn as HTMLElement).style.background =
              "rgba(255, 255, 255, 0.25)";
          }, 2000);
        } catch (err) {
          console.error("Erro ao copiar:", err);
        }
      });
    }, 0);

    return page;
  }

  function createSettingsPage() {
    const page = document.createElement("div");
    page.innerHTML = `
      <h1 style="color: #fff; font-family: 'Segoe UI', Arial, sans-serif; font-size: 24px; font-weight: 600; margin: 0 0 8px 0;">
        ⚙️ Configurações
      </h1>
      <p style="color: #b9bbbe; font-family: 'Segoe UI', Arial, sans-serif; font-size: 14px; margin: 0 0 32px 0;">
        Personalize sua experiência
      </p>
      
      <div style="background: #2f3136; padding: 24px; border-radius: 8px;">
        <h3 style="color: #fff; font-family: 'Segoe UI', Arial, sans-serif; font-size: 18px; margin: 0 0 16px 0;">
          ℹ️ Sobre
        </h3>
        <p style="color: #b9bbbe; font-family: 'Segoe UI', Arial, sans-serif; font-size: 14px; margin: 0; line-height: 1.6;">
          <strong style="color: #fff;">Futhero Launcher</strong><br>
          Versão 1.0.8<br>
          Desenvolvido por brenoluizdev com ❤️ para a comunidade
        </p>
      </div>
    `;
    return page;
  }

  menuButton.addEventListener("click", () => {
    createMainMenu();
  });

  window.addEventListener("load", () => {
    applyPerformanceSettings();
  });
})();
