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
  sendNotification: (message: string) => {
    try {
      console.log("[API] sendNotification chamado");
      console.log("[API] Tipo do message:", typeof message);
      console.log("[API] Valor do message:", message);
      console.log("[API] É string?", typeof message === 'string');
      
      let messageStr: string;
      
      if (message === null || message === undefined) {
        messageStr = "";
        console.warn("[API] Message é null/undefined, usando string vazia");
      } else if (typeof message === 'object') {
        console.error("[API] ERRO: Message é um objeto!", message);
        messageStr = JSON.stringify(message);
      } else {
        messageStr = String(message);
      }
      
      if (typeof messageStr !== 'string') {
        console.error("[API] ERRO: messageStr não é string primitiva!", typeof messageStr);
        messageStr = String(messageStr);
      }
      
      messageStr = messageStr.substring(0, 500);
      
      console.log("[API] Enviando via IPC:", messageStr);
      
      ipcRenderer.send("notification", messageStr);
      
      console.log("[API] IPC send concluído com sucesso");
    } catch (error: any) {
      console.error("[API] ERRO CRÍTICO ao enviar notificação:", error);
      console.error("[API] Stack trace:", error.stack);
    }
  },

  switchGame: (gameType: string) => {
    console.log("[API] switchGame chamado:", gameType);
    ipcRenderer.send("switch-game", gameType);
  },

  fullscreenElement: async (selector: string) => {
    console.log("[API] fullscreenElement chamado:", selector);
    return ipcRenderer.invoke("fullscreen-element", selector);
  },

  exitFullscreen: async () => {
    console.log("[API] exitFullscreen chamado");
    return ipcRenderer.invoke("exit-fullscreen");
  },

  getCurrentUrl: () => window.location.href,

  log: (message: string) => console.log(`[Futhero] ${message}`),
};

contextBridge.exposeInMainWorld("futheroLauncherAPI", futheroLauncherAPI);

console.log("[Preload] Futhero Launcher initialized.");
console.log("[Preload] API exposed: futheroLauncherAPI");