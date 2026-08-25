const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  isDesktopApp: true,
  platform: process.platform,
  onMediaPlayPause: (callback) => ipcRenderer.on('media-play-pause', callback)
});
