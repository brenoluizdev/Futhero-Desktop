import { contextBridge, ipcRenderer } from "electron";

/**
 * API segura exposta ao renderer process
 * Apenas as funções definidas aqui podem ser acessadas do lado do renderer
 */
const api = {
  /**
   * Abre um jogo específico
   */
  openGame: async (gameName: "bonk" | "haxball") => {
    return ipcRenderer.invoke("open-game", gameName);
  },

  /**
   * Fecha o jogo atual
   */
  closeGame: async () => {
    return ipcRenderer.invoke("close-game");
  },

  /**
   * Obtém o jogo atualmente aberto
   */
  getCurrentGame: async () => {
    return ipcRenderer.invoke("get-current-game");
  },

  /**
   * Verifica se há atualizações disponíveis
   */
  checkForUpdates: async () => {
    return ipcRenderer.invoke("check-for-updates");
  },

  /**
   * Obtém a versão atual do app
   */
  getAppVersion: async () => {
    return ipcRenderer.invoke("get-app-version");
  },

  /**
   * Listener para eventos de atualização
   */
  onUpdateAvailable: (callback: () => void) => {
    ipcRenderer.on("update-available", callback);
  },

  /**
   * Listener para eventos de atualização instalada
   */
  onUpdateInstalled: (callback: () => void) => {
    ipcRenderer.on("update-installed", callback);
  },

  /**
   * Remove listener
   */
  removeUpdateListener: (channel: string) => {
    ipcRenderer.removeAllListeners(channel);
  },
};

// Expor API ao contexto do renderer com isolamento
contextBridge.exposeInMainWorld("electronAPI", api);

// Tipagem TypeScript para o objeto global
declare global {
  interface Window {
    electronAPI: typeof api;
  }
}
