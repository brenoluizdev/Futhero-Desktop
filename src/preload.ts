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
  if (window.location.href.includes("bonk.io")) {
    console.log("[Preload] DOM loaded, aplicando fixes para Bonk.io");

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
  }
});

const futheroLauncherAPI = {
  sendNotification: (message: string) => {
    try {
      const messageStr = String(message).substring(0, 500);
      ipcRenderer.send("notification", messageStr);
    } catch (error: any) {
      console.error("[API] ERRO em sendNotification:", error);
    }
  },

  toggleUnlimitedFPS: () => ipcRenderer.invoke("toggleUnlimitedFPS"),
  isUnlockedFps: () => ipcRenderer.invoke("isUnlockedFps"),
  
  setFpsLimit: (limit: number | null) => ipcRenderer.invoke("setFpsLimit", limit),
  getFpsLimit: () => ipcRenderer.invoke("getFpsLimit"),
  getFpsConfig: () => ipcRenderer.invoke("getFpsConfig"),

  switchGame: (gameType: string) => {
    ipcRenderer.send("switch-game", gameType);
  },

  openJoinWindow: () => {
    ipcRenderer.send("open-join-window");
  },

  joinRoom: (link: string) => {
    ipcRenderer.send("join-room", link);
  },

  openExternal: (url: string) => {
    ipcRenderer.send("open-external", url);
  },

  fullscreenElement: (selector: string) => {
    return ipcRenderer.invoke("fullscreen-element", selector);
  },

  exitFullscreen: () => {
    return ipcRenderer.invoke("exit-fullscreen");
  },

  getCurrentUrl: () => window.location.href,

  log: (message: string) => console.log(`[Futhero] ${message}`),
};

contextBridge.exposeInMainWorld("futheroLauncherAPI", futheroLauncherAPI);

console.log("[Preload] Futhero Launcher initialized.");
console.log("[Preload] API exposed: futheroLauncherAPI");
