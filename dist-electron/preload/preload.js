"use strict";
const electron = require("electron");
const api = {
  /**
   * Abre um jogo específico
   */
  openGame: async (gameName) => {
    return electron.ipcRenderer.invoke("open-game", gameName);
  },
  /**
   * Fecha o jogo atual
   */
  closeGame: async () => {
    return electron.ipcRenderer.invoke("close-game");
  },
  /**
   * Obtém o jogo atualmente aberto
   */
  getCurrentGame: async () => {
    return electron.ipcRenderer.invoke("get-current-game");
  },
  /**
   * Verifica se há atualizações disponíveis
   */
  checkForUpdates: async () => {
    return electron.ipcRenderer.invoke("check-for-updates");
  },
  /**
   * Obtém a versão atual do app
   */
  getAppVersion: async () => {
    return electron.ipcRenderer.invoke("get-app-version");
  },
  /**
   * Listener para eventos de atualização
   */
  onUpdateAvailable: (callback) => {
    electron.ipcRenderer.on("update-available", callback);
  },
  /**
   * Listener para eventos de atualização instalada
   */
  onUpdateInstalled: (callback) => {
    electron.ipcRenderer.on("update-installed", callback);
  },
  /**
   * Remove listener
   */
  removeUpdateListener: (channel) => {
    electron.ipcRenderer.removeAllListeners(channel);
  }
};
electron.contextBridge.exposeInMainWorld("electronAPI", api);
