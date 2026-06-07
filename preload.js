const { contextBridge, ipcRenderer } = require('electron');

// Exposer des fonctions sécurisées à la partie React
contextBridge.exposeInMainWorld('electron', {
  // Exemple : envoyer un message au process principal
  sendMessage: (channel, data) => {
    ipcRenderer.send(channel, data);
  },
  
  // Exemple : écouter un message venant du process principal
  onMessage: (channel, callback) => {
    ipcRenderer.on(channel, (event, ...args) => callback(...args));
  }
});
