const dropzone = document.getElementById("dropzone");
const selectIdioma = document.getElementById("idioma");
const imagemPreview = document.getElementById("imagemPreview");

dropzone.addEventListener("paste", (event) => {
  const idiomaSelecionado = selectIdioma.value;

  const items = event.clipboardData.items;
  let blob = null;

  for (let i = 0; i < items.length; i++) {
    if (items[i].type.indexOf("image") !== -1) {
      blob = items[i].getAsFile();
      break;
    }
  }

  if (blob) {
    console.log("Imagem encontrada na área de transferência!");
    const reader = new FileReader();
    reader.onload = () => {
      console.log("Imagem carregada com sucesso!");
      const imagemPreview = document.createElement("img");
      imagemPreview.src = reader.result;
      imagemPreview.alt = "Preview da Imagem";
      imagemPreview.style.maxWidth = "100%";
      imagemPreview.style.maxHeight = "100%";
      imagemPreview.style.objectFit = "contain";

      // Remove o texto e adiciona a imagem ao dropzone
      dropzone.querySelector("p").style.display = "none";
      dropzone.appendChild(imagemPreview);
      window.electronAPI.colarImagem({
        img: reader.result,
        idioma: idiomaSelecionado,
      });
    };
    reader.readAsDataURL(blob);
  } else {
    console.error("Nenhuma imagem encontrada na área de transferência.");
  }
});

// Recebe o resultado do OCR do processo principal
window.electronAPI.receberResultadoOCR((_, text) => {
  resultadoOCR.textContent = text;
});
