const { contextBridge, ipcRenderer } = require("electron")

// Expor APIs seguras para o renderer
contextBridge.exposeInMainWorld("electronAPI", {
  loadEntries: () => ipcRenderer.invoke("load-entries"),
  saveEntries: (entries) => ipcRenderer.invoke("save-entries", entries),
  exportData: () => ipcRenderer.invoke("export-data"),
  importData: () => ipcRenderer.invoke("import-data"),
})
