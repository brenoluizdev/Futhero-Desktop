export enum GameType {
  BONK = 'bonk',
  HAXBALL = 'haxball'
}

export interface GameConfig {
  name: string;
  url: string;
  type: GameType;
}

export interface LauncherConfig {
  currentGame: GameType | null;
  autoUpdate: boolean;
  theme: 'dark' | 'light';
}

export interface IpcChannels {
  UPDATE_AVAILABLE: 'update-available';
  UPDATE_DOWNLOADED: 'update-downloaded';
  UPDATE_ERROR: 'update-error';
  LAUNCH_GAME: 'launch-game';
  CLOSE_GAME: 'close-game';
  SWITCH_GAME: 'switch-game';
  GET_CONFIG: 'get-config';
  SET_CONFIG: 'set-config';
  CHECK_UPDATES: 'check-updates';
  QUIT_APP: 'quit-app';
  TOGGLE_MODAL: 'toggle-modal';
  MODAL_ACTION: 'modal-action';
}

export interface ModalAction {
  type: 'navigate' | 'close' | 'switch-game' | 'donate' | 'about';
  payload?: any;
}

export interface ElectronAPI {
  launchGame: (game: GameType) => Promise<void>;
  closeGame: () => Promise<void>;
  switchGame: (game: GameType) => Promise<void>;
  getConfig: () => Promise<LauncherConfig>;
  setConfig: (config: Partial<LauncherConfig>) => Promise<void>;
  checkUpdates: () => Promise<void>;
  quitApp: () => void;
  onUpdateAvailable: (callback: (info: any) => void) => void;
  onUpdateDownloaded: (callback: (info: any) => void) => void;
  onUpdateError: (callback: (error: any) => void) => void;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}