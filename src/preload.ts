import { contextBridge, ipcRenderer } from 'electron';

const bonkLauncherAPI = {
  sendNotification: (message: string) => {
    ipcRenderer.send('notification', message);
  },
};

contextBridge.exposeInMainWorld('bonkLauncherAPI', bonkLauncherAPI);

console.log('[Preload] Futhero preload loaded.');
