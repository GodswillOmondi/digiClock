const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  toggleFullscreen: () => ipcRenderer.invoke('toggle-fullscreen'),
  setFullscreen: (value) => ipcRenderer.invoke('set-fullscreen', value),
  isFullscreen: () => ipcRenderer.invoke('is-fullscreen'),
  scheduleTimerNotification: (delayMs) => ipcRenderer.invoke('schedule-timer-notification', delayMs),
  cancelTimerNotification: (id) => ipcRenderer.send('cancel-timer-notification', id),
  onFullscreenChanged: (callback) => {
    const listener = (_event, state) => callback(state);
    ipcRenderer.on('fullscreen-changed', listener);
    return () => ipcRenderer.removeListener('fullscreen-changed', listener);
  },
});
