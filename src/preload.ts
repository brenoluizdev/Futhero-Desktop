import { contextBridge, ipcRenderer } from "electron";
import * as path from "path";

window.addEventListener("DOMContentLoaded", () => {
  const logoPath = path.join(__dirname, "../assets/images/icon.png");

  const overlay = document.createElement("div");
  overlay.id = "futhero-loader";
  overlay.style.position = "fixed";
  overlay.style.top = "0";
  overlay.style.left = "0";
  overlay.style.width = "100vw";
  overlay.style.height = "100vh";
  overlay.style.backgroundColor = "#000";
  overlay.style.display = "flex";
  overlay.style.justifyContent = "center";
  overlay.style.alignItems = "center";
  overlay.style.overflow = "hidden";
  overlay.style.zIndex = "9999";
  overlay.style.transition = "opacity 1s ease";

  const bgTextContainer = document.createElement("div");
  bgTextContainer.style.position = "absolute";
  bgTextContainer.style.width = "200%";
  bgTextContainer.style.height = "200%";
  bgTextContainer.style.display = "flex";
  bgTextContainer.style.flexWrap = "wrap";
  bgTextContainer.style.justifyContent = "center";
  bgTextContainer.style.alignItems = "center";
  bgTextContainer.style.opacity = "0.05";
  bgTextContainer.style.animation = "moveBackground 15s linear infinite";

  for (let i = 0; i < 20; i++) {
    const text = document.createElement("div");
    text.textContent = "FUTHERO";
    text.style.fontFamily = "'Poppins', sans-serif";
    text.style.fontWeight = "900";
    text.style.fontSize = "10vw";
    text.style.color = "transparent";
    text.style.webkitTextStroke = "1px white";
    text.style.margin = "40px";
    bgTextContainer.appendChild(text);
  }

  const logo = document.createElement("img");
  logo.src = "file://" + logoPath.replace(/\\/g, "/");
  logo.style.width = "180px";
  logo.style.height = "180px";
  logo.style.opacity = "0";
  logo.style.animation = "zoomLogo 2.5s ease forwards";

  const style = document.createElement("style");
  style.textContent = `
    @keyframes zoomLogo {
      0% { transform: scale(0.7); opacity: 0; }
      50% { transform: scale(1.15); opacity: 1; }
      100% { transform: scale(1); opacity: 1; }
    }

    @keyframes moveBackground {
      0% { transform: translate(0, 0); }
      100% { transform: translate(-10%, -10%); }
    }
  `;

  document.head.appendChild(style);
  overlay.appendChild(bgTextContainer);
  overlay.appendChild(logo);
  document.body.appendChild(overlay);

  window.addEventListener("load", () => {
    setTimeout(() => {
      overlay.style.opacity = "0";
      setTimeout(() => overlay.remove(), 1000);
    }, 2500);
  });
});

const bonkLauncherAPI = {
  sendNotification: (message: string) => ipcRenderer.send("notification", message),
};

contextBridge.exposeInMainWorld("bonkLauncherAPI", bonkLauncherAPI);
console.log("[Preload] Futhero splash screen loaded.");
