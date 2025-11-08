import { contextBridge, ipcRenderer } from 'electron';
import * as path from 'path';

const bonkLauncherAPI = {
  sendNotification: (message: string) => {
    ipcRenderer.send('notification', message);
  },

  injectFrontendScript: () => {
    const script = document.createElement('script');
    script.src = path.join('file://', __dirname, 'scripts/index.js');
    script.onload = () => {
      console.log('[Launcher] Frontend modification script injected successfully.');
    };
    document.body.appendChild(script);
  },
};

contextBridge.exposeInMainWorld('bonkLauncherAPI', bonkLauncherAPI);

window.addEventListener('DOMContentLoaded', () => {
  bonkLauncherAPI.injectFrontendScript();
});
