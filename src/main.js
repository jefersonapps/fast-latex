const { app, Tray, Menu, BrowserWindow, globalShortcut } = require("electron");
const path = require("path");

let tray = null;
let latexWindows = [];

const createLatexWindow = () => {
  const latexWindow = new BrowserWindow({
    width: 800,
    height: 650,
    autoHideMenuBar: true,
    icon: path.join(__dirname, "../public/icon.png"),
  });

  latexWindow.loadFile(path.join(__dirname, "latex.html"));

  latexWindow.on("close", (event) => {
    const index = latexWindows.indexOf(latexWindow);
    if (index > -1) {
      latexWindows.splice(index, 1);
    }
    latexWindow.destroy();
  });

  latexWindows.push(latexWindow);
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
        latexWindows.forEach((window) => window.destroy());
        app.quit();
      },
    },
  ]);
  tray.setToolTip("Criar LaTeX");
  tray.setContextMenu(contextMenu);
};

const toggleLatexWindowsVisibility = () => {
  const allHidden = latexWindows.every((window) => !window.isVisible());
  latexWindows.forEach((window) => {
    if (allHidden) {
      window.show();
    } else {
      window.hide();
    }
  });
};

app.whenReady().then(() => {
  createTray();
  app.dock?.hide();

  globalShortcut.register("Control+Alt+L", () => {
    if (latexWindows.length > 0) {
      toggleLatexWindowsVisibility();
    }
  });
});

app.on("window-all-closed", () => {
  latexWindows.forEach((window) => window.hide());
});

app.on("will-quit", () => {
  globalShortcut.unregisterAll();
});
