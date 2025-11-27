/**
 * Tipos para a API do Electron exposta via preload
 */

export interface ElectronAPI {
  /**
   * Abre um jogo específico
   */
  openGame: (gameName: "bonk" | "haxball") => Promise<{ success: boolean }>;

  /**
   * Fecha o jogo atual
   */
  closeGame: () => Promise<{ success: boolean }>;

  /**
   * Obtém o jogo atualmente aberto
   */
  getCurrentGame: () => Promise<{ game: "bonk" | "haxball" | null }>;

  /**
   * Verifica se há atualizações disponíveis
   */
  checkForUpdates: () => Promise<{ hasUpdate: boolean }>;

  /**
   * Obtém a versão atual do app
   */
  getAppVersion: () => Promise<{ version: string }>;

  /**
   * Listener para eventos de atualização
   */
  onUpdateAvailable: (callback: () => void) => void;

  /**
   * Listener para eventos de atualização instalada
   */
  onUpdateInstalled: (callback: () => void) => void;

  /**
   * Remove listener
   */
  removeUpdateListener: (channel: string) => void;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}
