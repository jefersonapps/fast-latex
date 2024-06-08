const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  colarImagem: (imageDataURL) => ipcRenderer.send("colar-imagem", imageDataURL),
  receberResultadoOCR: (callback) => ipcRenderer.on("ocr-resultado", callback),
});
