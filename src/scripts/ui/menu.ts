(() => {
  console.log("[Launcher] UI Menu injected.");

  // Injeta CSS
  const style = document.createElement("link");
  style.rel = "stylesheet";
  style.href = "app://scripts/ui/menu.css";
  document.head.appendChild(style);

  // Cria o menu
  const menu = document.createElement("div");
  menu.id = "fh-menu";

  // Ícone principal (usando a letra F igual sua logo)
  const icon = document.createElement("div");
  icon.className = "fh-menu-icon";
  icon.textContent = "F";

  menu.appendChild(icon);

  // Container dos itens
  const items = document.createElement("div");
  items.id = "fh-menu-items";
  items.style.display = "none";

  const buttons = [
    { label: "Recarregar", action: () => location.reload() },
    {
      label: "Mudar para Haxball",
      action: () => (window.location.href = "https://haxball.com/"),
    },
    { label: "Abrir Configurações (future)", action: () => alert("Em breve!") },
  ];

  buttons.forEach((btn) => {
    const el = document.createElement("div");
    el.className = "fh-menu-item";
    el.textContent = btn.label;
    el.onclick = btn.action;
    items.appendChild(el);
  });

  menu.appendChild(items);
  document.body.appendChild(menu);

  // Lógica de expandir
  let open = false;
  icon.addEventListener("click", () => {
    open = !open;
    if (open) {
      menu.classList.add("expanded");
      items.style.display = "block";
    } else {
      menu.classList.remove("expanded");
      items.style.display = "none";
    }
  });
})();
