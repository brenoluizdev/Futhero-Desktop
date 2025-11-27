import { contextBridge, ipcRenderer } from 'electron';

// API segura exposta ao renderer
contextBridge.exposeInMainWorld('electronAPI', {
  // Lançamento de jogos
  launchGame: (game: 'bonk' | 'haxball') => 
    ipcRenderer.invoke('launch-game', game),
  
  closeGame: () => 
    ipcRenderer.invoke('close-game'),
  
  switchGame: (game: 'bonk' | 'haxball') => 
    ipcRenderer.invoke('switch-game', game),
  
  getCurrentGame: () => 
    ipcRenderer.invoke('get-current-game'),

  // Informações do app
  getAppVersion: () => 
    ipcRenderer.invoke('get-app-version'),

  // Auto-update
  quitAndInstall: () => 
    ipcRenderer.invoke('quit-and-install'),

  // Event listeners
  onGameLoaded: (callback: (game: string) => void) => {
    ipcRenderer.on('game-loaded', (_, game) => callback(game));
  },

  onGameClosed: (callback: () => void) => {
    ipcRenderer.on('game-closed', () => callback());
  },

  onUpdateAvailable: (callback: () => void) => {
    ipcRenderer.on('update-available', () => callback());
  },

  onUpdateDownloaded: (callback: () => void) => {
    ipcRenderer.on('update-downloaded', () => callback());
  }
});

// Type definitions para TypeScript
export interface ElectronAPI {
  launchGame: (game: 'bonk' | 'haxball') => Promise<{ success: boolean }>;
  closeGame: () => Promise<{ success: boolean }>;
  switchGame: (game: 'bonk' | 'haxball') => Promise<{ success: boolean }>;
  getCurrentGame: () => Promise<'bonk' | 'haxball' | null>;
  getAppVersion: () => Promise<string>;
  quitAndInstall: () => Promise<void>;
  onGameLoaded: (callback: (game: string) => void) => void;
  onGameClosed: (callback: () => void) => void;
  onUpdateAvailable: (callback: () => void) => void;
  onUpdateDownloaded: (callback: () => void) => void;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}