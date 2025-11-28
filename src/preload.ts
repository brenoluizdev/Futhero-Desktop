import { contextBridge, ipcRenderer } from "electron";

const originalSend = ipcRenderer.send.bind(ipcRenderer);
(ipcRenderer as any).send = function(channel: string, ...args: any[]) {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('[IPC INTERCEPTOR] Canal:', channel);
  console.log('[IPC INTERCEPTOR] Args:', args);
  
  args.forEach((arg, index) => {
    console.log(`[IPC INTERCEPTOR] Arg ${index}:`, typeof arg, arg);
    
    try {
      const serialized = JSON.stringify(arg);
      console.log(`[IPC INTERCEPTOR] Arg ${index} OK - tamanho: ${serialized.length} chars`);
    } catch (e: any) {
      console.error(`[IPC INTERCEPTOR] ❌ Arg ${index} NÃO serializável!`, e.message);
      
      if (arg && typeof arg === 'object') {
        console.log('[IPC INTERCEPTOR] Chaves:', Object.keys(arg));
      }
    }
  });
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  try {
    return originalSend(channel, ...args);
  } catch (error: any) {
    console.error('[IPC INTERCEPTOR] ❌❌❌ ERRO NO SEND:', error.message);
    console.error('[IPC INTERCEPTOR] Stack:', error.stack);
    throw error;
  }
};

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
      console.log("[API] message:", message);
      
      const messageStr = String(message).substring(0, 500);
      
      console.log("[API] Enviando via IPC:", messageStr);
      ipcRenderer.send("notification", messageStr);
      console.log("[API] Send concluído");
      
    } catch (error: any) {
      console.error("[API] ERRO:", error);
    }
  },

  switchGame: (gameType: string) => {
    console.log("[API] switchGame:", gameType);
    ipcRenderer.send("switch-game", gameType);
  },

  fullscreenElement: async (selector: string) => {
    console.log("[API] fullscreenElement:", selector);
    return ipcRenderer.invoke("fullscreen-element", selector);
  },

  exitFullscreen: async () => {
    console.log("[API] exitFullscreen");
    return ipcRenderer.invoke("exit-fullscreen");
  },

  getCurrentUrl: () => window.location.href,

  log: (message: string) => console.log(`[Futhero] ${message}`),
};

contextBridge.exposeInMainWorld("futheroLauncherAPI", futheroLauncherAPI);

console.log("[Preload] Futhero Launcher initialized.");
console.log("[Preload] API exposed: futheroLauncherAPI");