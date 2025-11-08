import { contextBridge, ipcRenderer } from 'electron';

const bonkLauncherAPI = {
  sendNotification: (message: string) => {
    ipcRenderer.send('notification', message);
  },

  injectFrontendScript: () => {
    const script = document.createElement('script');
    script.src = 'frontend-mod.js';
    script.onload = () => {
      console.log('Frontend modification script injected successfully.');
    };
    document.body.appendChild(script);
  }
};

contextBridge.exposeInMainWorld('bonkLauncherAPI', bonkLauncherAPI);

window.addEventListener('DOMContentLoaded', () => {

});

window.addEventListener('DOMContentLoaded', () => {
  bonkLauncherAPI.injectFrontendScript();
});
