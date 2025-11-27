import { contextBridge, ipcRenderer } from "electron";

window.addEventListener("DOMContentLoaded", () => {
  console.log("[Preload] DOM loaded, aplicando fixes Bonk.io");

  const wait = setInterval(() => {
    const canvas = document.getElementById("gamecanvas")
      || document.getElementById("gameframe")
      || document.querySelector("canvas");

    if (canvas) {
      clearInterval(wait);
      console.log("[BonkFix] Canvas encontrado, desbloqueando resize.");
      canvas.style.width = "100%";
      canvas.style.height = "100%";

      window.dispatchEvent(new Event("resize"));
    }
  }, 50);
});

const futheroLauncherAPI = {
  sendNotification: (message: string) => 
    ipcRenderer.send("notification", message),
  
  switchGame: (gameType: string) => 
    ipcRenderer.send("switch-game", gameType),
  
  getCurrentUrl: () => window.location.href,
  
  log: (message: string) => 
    console.log(`[Futhero] ${message}`),
};

contextBridge.exposeInMainWorld("futheroLauncherAPI", futheroLauncherAPI);

console.log("[Preload] Futhero Launcher initialized.");
console.log("[Preload] API exposed: futheroLauncherAPI");