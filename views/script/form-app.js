const choosenImages = document.querySelector(".choosenImages");
const choosenImage = document.querySelector(".choosenImage");
const inputImages = document.querySelector("#images");
const inputImage = document.querySelector("#image");
const submitBtn = document.querySelector(".btn");
const inputColors = document.querySelector("#color");
const choosenColors = document.querySelector(".choosenColors")
  ? document.querySelector(".choosenColors")
  : document.createElement("div");
choosenColors.setAttribute("class", "choosenColors");
const hiddenColors = document.querySelector("#hiddenColors");
const priceContainer = document.querySelector("[price]");
const colorsContainer = document.querySelector("[colors]");
const imageContainer = document.querySelector("[image]");
const imagesContainer = document.querySelector("[images]");
const priceValid = document.createElement("strong");
priceValid.setAttribute("class", "fail");
const colorsValid = document.createElement("strong");
colorsValid.setAttribute("class", "fail");
const imageValid = document.createElement("strong");
imageValid.setAttribute("class", "fail");
const imagesValid = document.createElement("strong");
imagesValid.setAttribute("class", "fail");
let hiddenColorValues = [];
if (hiddenColors.value) {
  hiddenColorValues = JSON.parse(hiddenColors.value);
}

inputColors.addEventListener("change", () => {
  const pick = inputColors.value;
  const color = document.createElement("div");
  color.style.background = pick;
  color.innerHTML = `<i class='bx bx-x' ></i>`;
  choosenColors.appendChild(color);
  colorsContainer.querySelector(".choosenColors") ||
    colorsContainer.appendChild(choosenColors);
  hiddenColorValues.push(pick);
  hiddenColors.value = JSON.stringify(hiddenColorValues);
});
choosenColors.addEventListener("click", (e) => {
  if (e.target === choosenColors) return;
  const index = Array.from(e.target.parentNode.parentNode.children).indexOf(
    e.target.parentNode
  );
  hiddenColorValues.splice(index, 1);
  hiddenColors.value = JSON.stringify(hiddenColorValues);
  choosenColors.removeChild(e.target.parentNode);
  choosenColors.children.length || choosenColors.remove();
});
submitBtn.addEventListener("click", (e) => {
  const price = parseFloat(document.querySelector("#price").value);
  priceContainer.querySelector("strong") &&
    priceContainer.removeChild(priceContainer.querySelector("strong"));
  colorsContainer.querySelector("strong") &&
    colorsContainer.removeChild(colorsContainer.querySelector("strong"));
  imagesContainer.querySelector("strong") &&
    imagesContainer.removeChild(imagesContainer.querySelector("strong"));
  imageContainer.querySelector("strong") &&
    imageContainer.removeChild(imageContainer.querySelector("strong"));
  if (!price || price < 0) {
    e.preventDefault();
    priceValid.innerHTML = "Please input a number greater than 0";
    priceContainer.appendChild(priceValid);
  }
  if (!hiddenColorValues.length) {
    e.preventDefault();
    colorsValid.innerHTML = "Please choose at least 1 color";
    colorsContainer.appendChild(colorsValid);
  }
  if (!choosenImage.children.length) {
    e.preventDefault();
    imageValid.innerHTML = "Please choose 1 image";
    imageContainer.appendChild(imageValid);
  }

  if (!choosenImages.children.length) {
    e.preventDefault();
    imagesValid.innerHTML = "Please choose at least 1 picture";
    imagesContainer.appendChild(imagesValid);
  }
  if (choosenImages.children.length > 5) {
    e.preventDefault();
    imagesValid.innerHTML = "Please choose under 5 pictures";
    imagesContainer.appendChild(imagesValid);
  }
});
inputImages.addEventListener("input", (e) => {
  if (e.target.files.length > 4) {
    e.preventDefault();
    imagesValid.innerHTML = "Please choose under 5 pictures";
    imagesContainer.appendChild(imagesValid);
    return;
  }
  choosenImages.innerHTML = "";
  for (let i = 0; i < e.target.files.length; i++) {
    const img = document.createElement("img");
    img.onload = () => {
      URL.revokeObjectURL(img.src);
      choosenImages.appendChild(img);
    };
    img.style.width = "50px";
    img.style.height = "60px";
    img.style.objectFit = "cover";
    img.src = URL.createObjectURL(e.target.files[i]);
  }
});
inputImage.addEventListener("input", (e) => {
  choosenImage.innerHTML = "";
  const img = document.createElement("img");
  img.onload = () => {
    URL.revokeObjectURL(img.src);
    choosenImage.appendChild(img);
  };
  img.style.width = "50px";
  img.style.height = "60px";
  img.style.objectFit = "cover";
  img.src = URL.createObjectURL(e.target.files[0]);
});
