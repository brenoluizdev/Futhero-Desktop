(() => {
  console.log("[Launcher] UI Menu injected.");

  const style = document.createElement("link");
  style.rel = "stylesheet";
  style.href = "app://scripts/ui/menu.css";
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
    { label: "Abrir Configurações (future)", action: () => alert("Em breve!") },
  ];

  buttons.forEach((btn) => {
    const el = document.createElement("div");
    el.className = "fh-menu-item";
    el.textContent = btn.label;
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
})();