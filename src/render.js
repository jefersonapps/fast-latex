window.MathJax = {
  tex: {
    inlineMath: [['$', '$'], ['\\(', '\\)']],
    packages: {'[+]': ['amsmath']}
  },
  svg: {
    fontCache: 'global'
  },
  options: {
    skipHtmlTags: ['script', 'noscript', 'style', 'textarea', 'pre']
  },
};

const script = document.createElement('script');
script.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js';
script.async = true;
script.id = 'MathJax-script';

script.onload = () => {
  const container = document.getElementById("container");
  const latexRender = document.getElementById("latex-render");
  const latexCode = document.getElementById("latex-code");
  const textColor = document.getElementById("text-color");
  const backgroundColor = document.getElementById("background-color");
  const externalColor = document.getElementById("external-color");
  const borderColor = document.getElementById("border-color");
  const borderRadius = document.getElementById("border-radius");
  const textSize = document.getElementById("text-size");
  const lineStyle = document.getElementById("line-style");
  const borderWidth = document.getElementById("border-width");

  function updateStyles() {
    latexRender.style.color = textColor.value ?? "black";
    latexRender.style.backgroundColor = backgroundColor.value ?? "white";
    container.style.backgroundColor = externalColor.value ?? "white";
    latexRender.style.borderRadius = `${borderRadius.value}px`;
    latexRender.style.fontSize = `${textSize.value}px`;
    latexRender.style.borderStyle = lineStyle.value;
    latexRender.style.borderColor = borderColor.value;
    latexRender.style.borderWidth = `${borderWidth.value}px`;
  }

  textColor.addEventListener("input", updateStyles);
  backgroundColor.addEventListener("input", updateStyles);
  externalColor.addEventListener("input", updateStyles);
  borderColor.addEventListener("input", updateStyles);
  borderRadius.addEventListener("input", updateStyles);
  textSize.addEventListener("input", updateStyles);
  lineStyle.addEventListener("change", updateStyles);
  borderWidth.addEventListener("input", updateStyles);

  updateStyles()

  latexCode.addEventListener("input", () => {
    const latex = latexCode.value;
    latexRender.innerHTML = `\\begin{align}${latex}\\end{align}`;

    MathJax.typesetPromise([latexRender])
      .then(() => {
        console.log("MathJax processed successfully!");
      })
      .catch((err) => {
        console.error("Error processing MathJax:", err);
      });
  });
};

document.body.appendChild(script);
