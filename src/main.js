const {
  app,
  Tray,
  Menu,
  dialog,
  clipboard,
  ipcMain,
  BrowserWindow,
} = require("electron");

const path = require("path");
const fs = require("fs");
const Tesseract = require("tesseract.js");
const Base64 = require("js-base64").Base64;

let tray = null;
let idiomaSelecionado = "por";

let janelaColarImagem = null;

const criarJanelaColarImagem = () => {
  janelaColarImagem = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
    autoHideMenuBar: true,
  });
  janelaColarImagem.loadFile(path.join(__dirname, "colarImagem.html"));

  // Impede que a janela feche o aplicativo
  janelaColarImagem.on("close", (event) => {
    event.preventDefault();
    janelaColarImagem.hide(); // Esconde a janela
  });

  janelaColarImagem.on("closed", () => {
    janelaColarImagem = null;
  });
};

ipcMain.on("colar-imagem", async (event, data) => {
  console.log("entrou", data.idioma);
  try {
    realizarOCR(data.img, data.idioma);
  } catch (error) {
    console.error("Erro ao processar a imagem:", error);
    dialog.showErrorBox("Erro", "Ocorreu um erro ao processar a imagem.");
  }
});

const createTray = () => {
  tray = new Tray(path.join(__dirname, "../public/icon.png"));

  const atualizarMenuIdioma = () => {
    const menuTemplate = [
      {
        label: "Português",
        type: "radio",
        checked: idiomaSelecionado === "por",
        click: () => {
          idiomaSelecionado = "por";
          atualizarMenuIdioma();
        },
      },
      {
        label: "Inglês",
        type: "radio",
        checked: idiomaSelecionado === "eng",
        click: () => {
          idiomaSelecionado = "eng";
          atualizarMenuIdioma();
        },
      },
    ];

    const contextMenu = Menu.buildFromTemplate([
      {
        label: "Importar Imagem",
        click: importarImagem,
      },
      {
        label: "Idioma",
        submenu: menuTemplate,
      },
      { type: "separator" },
      {
        label: "Colar Imagem",
        click: criarJanelaColarImagem,
      },
      { type: "separator" },
      {
        label: "Sair",
        click: () => {
          if (janelaColarImagem) {
            janelaColarImagem.destroy(); // Usa destroy() para fechar completamente
          }
          app.quit();
        },
      },
    ]);
    tray.setToolTip("OCR de imagens");
    tray.setContextMenu(contextMenu);
  };

  atualizarMenuIdioma();
};

const importarImagem = () => {
  dialog
    .showOpenDialog({
      properties: ["openFile"],
      filters: [
        { name: "Images", extensions: ["jpg", "png", "jpeg", "bmp", "tiff"] },
      ],
    })
    .then((result) => {
      if (!result.canceled) {
        const filePath = result.filePaths[0];
        realizarOCR(filePath, idiomaSelecionado);
      }
    })
    .catch((err) => {
      console.error("Erro ao importar imagem:", err);
    });
};

const realizarOCR = async (imageData, idioma = "por") => {
  console.log(idioma);
  try {
    let imageBuffer;

    if (typeof imageData === "string" && imageData.startsWith("data:image/")) {
      // Converte Data URL para buffer usando js-base64
      imageBuffer = Buffer.from(Base64.atob(imageData.split(",")[1]), "binary");

      // Converção do buffer do Node.js para Uint8Array
      const uint8Array = new Uint8Array(imageBuffer);

      const {
        data: { text },
      } = await Tesseract.recognize(uint8Array, idioma);

      if (janelaColarImagem) {
        janelaColarImagem.webContents.send("ocr-resultado", text);
      }

      clipboard.writeText(text);
      console.log("Texto copiado para a área de transferência!");

      dialog.showMessageBox({
        type: "info",
        title: "OCR Concluído",
        message: "O texto da imagem foi copiado para a área de transferência!",
      });
    } else {
      // Assume que imageData é um caminho de arquivo
      // Lê o arquivo e converte para Uint8Array diretamente
      const uint8Array = new Uint8Array(await fs.promises.readFile(imageData));

      const {
        data: { text },
      } = await Tesseract.recognize(uint8Array, idioma);

      clipboard.writeText(text);
      console.log("Texto copiado para a área de transferência!");

      dialog.showMessageBox({
        type: "info",
        title: "OCR Concluído",
        message: "O texto da imagem foi copiado para a área de transferência!",
      });
    }
  } catch (error) {
    console.error("Erro ao realizar OCR:", error);
  }
};

app.whenReady().then(() => {
  createTray();
  app.dock.hide();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
