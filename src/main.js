const { app, Tray, Menu, BrowserWindow, globalShortcut } = require("electron");

const path = require("path");

let tray = null;

let latexWindow = null;

const createLatexWindow = () => {
  latexWindow = new BrowserWindow({
    width: 800,
    height: 650,
    autoHideMenuBar: true,
    icon: path.join(__dirname, "../public/icon.png")
  });
  latexWindow.loadFile(path.join(__dirname, "latex.html"));

  globalShortcut.register("Shift+L", () => {
    if (latexWindow.isVisible()) {
      latexWindow.hide();
    } else {
      latexWindow.show();
    }
  });

  latexWindow.on("close", (event) => {
    event.preventDefault();
    latexWindow?.hide();
  });
};

const createTray = () => {
  tray = new Tray(path.join(__dirname, "../public/icon.png"));

  const contextMenu = Menu.buildFromTemplate([
    {
      label: "Criar LaTeX",
      click: createLatexWindow,
    },
    { type: "separator" },
    {
      label: "Sair",
      click: () => {
        if (latexWindow) {
          latexWindow.destroy();
        }
        app.quit();
      },
    },
  ]);
  tray.setToolTip("Criar LaTeX");
  tray.setContextMenu(contextMenu);
};

app.whenReady().then(() => {
  createTray();
  app.dock?.hide();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
