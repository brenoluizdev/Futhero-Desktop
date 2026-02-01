export {};

declare global {
  interface Window {
    futheroLauncherAPI: {
      sendNotification: (message: string) => void;
      switchGame: (gameType: string) => void;
      fullscreen: (onOff: boolean) => void;
      getCurrentUrl: () => string;
      log: (message: string) => void;
      startAuth: () => void;
      logout: () => Promise<boolean>;
      checkAuth: () => Promise<boolean>;
      onAuthSuccess: (callback: () => void) => void;
    };
  }
}
