/**
 * Preload Script Principal
 * Expõe API segura para o renderer via contextBridge
 */

import { contextBridge, ipcRenderer } from 'electron';
import { GameType, ElectronAPI } from '../types';

// API exposta para o renderer
const electronAPI: ElectronAPI = {
  // Lançar jogo
  launchGame: (game: GameType) => ipcRenderer.invoke('launch-game', game),

  // Fechar jogo
  closeGame: () => ipcRenderer.invoke('close-game'),

  // Trocar jogo
  switchGame: (game: GameType) => ipcRenderer.invoke('switch-game', game),

  // Obter configuração
  getConfig: () => ipcRenderer.invoke('get-config'),

  // Definir configuração
  setConfig: (config) => ipcRenderer.invoke('set-config', config),

  // Verificar atualizações
  checkUpdates: () => ipcRenderer.invoke('check-updates'),

  // Sair do app
  quitApp: () => ipcRenderer.send('quit-app'),

  // Listeners para atualizações
  onUpdateAvailable: (callback) => {
    ipcRenderer.on('update-available', (_event, info) => callback(info));
  },

  onUpdateDownloaded: (callback) => {
    ipcRenderer.on('update-downloaded', (_event, info) => callback(info));
  },

  onUpdateError: (callback) => {
    ipcRenderer.on('update-error', (_event, error) => callback(error));
  },
};

// Expor API via contextBridge
contextBridge.exposeInMainWorld('electronAPI', electronAPI);
