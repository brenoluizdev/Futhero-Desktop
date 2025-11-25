(() => {
  console.log("[Launcher] UI Menu injected.");

  const style = document.createElement("link");
  style.rel = "stylesheet";
  style.href = "app://scripts/shared/ui/menu.css";
  document.head.appendChild(style);

  const menu = document.createElement("div");
  menu.id = "fh-menu";

  const icon = document.createElement("div");
  icon.className = "fh-menu-icon";
  icon.textContent = "F";

  menu.appendChild(icon);

  const items = document.createElement("div");
  items.id = "fh-menu-items";

  const currentUrl = window.location.href;
  const isHaxball = currentUrl.includes("haxball.com");
  const isBonk = currentUrl.includes("bonk.io");

  let switchGameLabel = "Mudar para Haxball";
  let switchGameUrl = "https://www.haxball.com/";

  if (isHaxball) {
    switchGameLabel = "Mudar para Bonk.io";
    switchGameUrl = "https://bonk.io/";
  } else if (isBonk) {
    switchGameLabel = "Mudar para Haxball";
    switchGameUrl = "https://www.haxball.com/";
  }

  let switchGameButton: HTMLDivElement;

  const buttons = [
    { label: "Recarregar", action: () => location.reload() },
    {
      label: switchGameLabel,
      action: () => {
        window.location.href = switchGameUrl;
      },
      isSwitchButton: true,
    },
    { 
      label: "Discord", 
      action: () => {
        showDiscordModal();
      },
      icon: "discord"
    },
    { label: "Abrir Configurações (future)", action: () => alert("Em breve!") },
  ];

  buttons.forEach((btn) => {
    const el = document.createElement("div");
    el.className = "fh-menu-item";
  
    if (btn.icon === "discord") {
      el.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style="margin-right: 8px; vertical-align: middle;">
          <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
        </svg>
        <span>${btn.label}</span>
      `;
    } else {
      el.textContent = btn.label;
    }
    
    el.onclick = btn.action;

    if (btn.isSwitchButton) {
      switchGameButton = el;
    }

    items.appendChild(el);
  });

  menu.appendChild(items);
  document.body.appendChild(menu);

  let open = false;

  icon.addEventListener("click", () => {
    open = !open;

    if (open) {
      menu.classList.add("expanded");

      setTimeout(() => {
        items.style.pointerEvents = "auto";
        items.style.opacity = "1";
      }, 120);
    } else {
      items.style.opacity = "0";
      items.style.pointerEvents = "none";

      setTimeout(() => {
        menu.classList.remove("expanded");
      }, 180);
    }
  });

  const updateSwitchButton = () => {
    const url = window.location.href;
    if (url.includes("haxball.com")) {
      switchGameButton.textContent = "Mudar para Bonk.io";
      switchGameButton.onclick = () => (window.location.href = "https://bonk.io/");
    } else if (url.includes("bonk.io")) {
      switchGameButton.textContent = "Mudar para Haxball";
      switchGameButton.onclick = () => (window.location.href = "https://www.haxball.com/");
    }
  };

  window.addEventListener("popstate", updateSwitchButton);

  function showDiscordModal() {
    const overlay = document.createElement("div");
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 999999;
      backdrop-filter: blur(5px);
    `;

    const modal = document.createElement("div");
    modal.style.cssText = `
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 16px;
      padding: 32px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
      max-width: 400px;
      width: 90%;
      text-align: center;
      animation: modalSlideIn 0.3s ease-out;
    `;

    // Adiciona animação
    const styleSheet = document.createElement("style");
    styleSheet.textContent = `
      @keyframes modalSlideIn {
        from {
          opacity: 0;
          transform: translateY(-20px) scale(0.95);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }
    `;
    document.head.appendChild(styleSheet);

    modal.innerHTML = `
      <div style="margin-bottom: 24px;">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="white" style="filter: drop-shadow(0 4px 8px rgba(0,0,0,0.2));">
          <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
        </svg>
      </div>
      <h2 style="color: white; font-family: 'Segoe UI', Arial, sans-serif; font-size: 24px; margin: 0 0 12px 0; font-weight: 600;">
        Junte-se ao nosso Discord!
      </h2>
      <p style="color: rgba(255, 255, 255, 0.9); font-family: 'Segoe UI', Arial, sans-serif; font-size: 14px; margin: 0 0 24px 0;">
        Faça parte da nossa comunidade
      </p>
      <div style="background: rgba(255, 255, 255, 0.15); border-radius: 8px; padding: 16px; margin-bottom: 20px; backdrop-filter: blur(10px);">
        <input 
          type="text" 
          value="https://discord.gg/qRJ4UCMfja" 
          readonly
          id="discord-link-input"
          style="
            width: 100%;
            background: rgba(255, 255, 255, 0.2);
            border: 1px solid rgba(255, 255, 255, 0.3);
            border-radius: 6px;
            padding: 10px;
            color: white;
            font-family: 'Consolas', 'Courier New', monospace;
            font-size: 14px;
            text-align: center;
            outline: none;
            box-sizing: border-box;
          "
        />
      </div>
      <div style="display: flex; gap: 12px; justify-content: center;">
        <button 
          id="copy-discord-btn"
          style="
            background: rgba(255, 255, 255, 0.25);
            border: 1px solid rgba(255, 255, 255, 0.3);
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            cursor: pointer;
            font-family: 'Segoe UI', Arial, sans-serif;
            font-size: 14px;
            font-weight: 600;
            transition: all 0.2s;
            backdrop-filter: blur(10px);
          "
          onmouseover="this.style.background='rgba(255,255,255,0.35)'; this.style.transform='translateY(-2px)'"
          onmouseout="this.style.background='rgba(255,255,255,0.25)'; this.style.transform='translateY(0)'"
        >
          📋 Copiar Link
        </button>
        <button 
          id="close-discord-btn"
          style="
            background: rgba(220, 38, 38, 0.8);
            border: 1px solid rgba(255, 255, 255, 0.2);
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            cursor: pointer;
            font-family: 'Segoe UI', Arial, sans-serif;
            font-size: 14px;
            font-weight: 600;
            transition: all 0.2s;
          "
          onmouseover="this.style.background='rgba(185, 28, 28, 0.9)'; this.style.transform='translateY(-2px)'"
          onmouseout="this.style.background='rgba(220, 38, 38, 0.8)'; this.style.transform='translateY(0)'"
        >
          ✕ Fechar
        </button>
      </div>
    `;

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    const copyBtn = document.getElementById("copy-discord-btn")!;
    const input = document.getElementById("discord-link-input") as HTMLInputElement;
    
    copyBtn.addEventListener("click", () => {
      input.select();
      input.setSelectionRange(0, 99999);
      
      try {
        document.execCommand("copy");
        copyBtn.textContent = "✓ Copiado!";
        copyBtn.style.background = "rgba(34, 197, 94, 0.8)";
        
        setTimeout(() => {
          copyBtn.textContent = "📋 Copiar Link";
          copyBtn.style.background = "rgba(255, 255, 255, 0.25)";
        }, 2000);
      } catch (err) {
        console.error("Erro ao copiar:", err);
      }
    });

    const closeBtn = document.getElementById("close-discord-btn")!;
    closeBtn.addEventListener("click", () => {
      overlay.remove();
      styleSheet.remove();
    });

    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) {
        overlay.remove();
        styleSheet.remove();
      }
    });
  }
})();