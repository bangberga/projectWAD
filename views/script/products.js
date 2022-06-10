const container = document.querySelector(".products > div");
const searchInput = document.querySelector(".search-input");
const categoryBtns = document.getElementsByName("category");
const company = document.querySelector(".company");
const priceInput = document.getElementsByName("price")[0];
const priceDisplay = document.querySelector(".price");
const sortInput = document.querySelector(".sort-input");
const clearBtn = document.querySelector(".clear-btn");
const total = document.querySelector(".total");
const viewBtns = document.querySelectorAll(".btn-container button");
let viewActive = 0;
let activeIndex = 0;

const fetchProducts = async () => {
  const response = await fetch("/getproducts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: searchInput.value,
      category: categoryBtns[activeIndex].id,
      company: company.value,
      price: priceInput.value,
      order: sortInput.value,
    }),
  });
  const { success, products } = await response.json();
  if (!success) return;
  const found = products.length;
  total.innerHTML = `${found} products found`;
  if (!found) {
    const h5 = document.createElement("h5");
    h5.innerHTML = "Sorry, no products matched your search.";
    const existSect = container.querySelectorAll("section")[1];
    const existH5 = document.querySelector(".products > div > h5");
    existH5 && container.removeChild(existH5);
    existSect && container.removeChild(existSect);
    container.appendChild(h5);
  } else {
    const section = document.createElement("section");
    const productContainer = document.createElement("div");
    productContainer.setAttribute("class", "products-container");

    if (viewActive) {
      section.setAttribute("class", "list-view");
      products.forEach((product) => {
        const { id, product_name, image_link, price, discount, description } =
          product;
        const article = document.createElement("article");
        article.innerHTML = `
        <img src="../images/${image_link}" alt="${product_name}" />
        <div>
          <h4>${product_name}</h4>
          <h5 class="price">$${
            discount
              ? `<span class="discount" style="text-decoration: line-through;">$${price}</span>
              <span class="newprice">$${(price - price * discount).toFixed(
                2
              )}<span class="percent">-${discount * 100}%</span>
              </span>`
              : `$${price}`
          }</h5>
          <p>${description.substring(0, 150)}...</p>
          <a class="btn" href="/products/${id}">Details</a>
        </div>
        `;
        article.querySelector("img").onload = () =>
          section.appendChild(article);
      });
    } else {
      section.setAttribute("class", "grid-view");
      products.forEach((product) => {
        const { id, product_name, image_link, price, discount } = product;
        const article = document.createElement("article");
        article.innerHTML = `
        <div class="container">
          <img src="../images/${image_link}" alt="${product_name}" />
          <a class="link" href="/products/${id}"><i class='bx bx-search'></i></a>
        </div>
        <footer>
          <h5>${product_name}</h5>
          <p>${
            discount
              ? `<span class="discount" style="text-decoration: line-through;">$${price}</span> 
              <span class="newprice">$${(price - price * discount).toFixed(
                2
              )}<span class="percent">-${discount * 100}%</span>
              </span>`
              : `$${price}`
          }</p>
        </footer>
        `;
        article.querySelector("img").onload = () =>
          productContainer.appendChild(article);
      });
      section.appendChild(productContainer);
    }
    const existSect = container.querySelectorAll("section")[1];
    const existH5 = document.querySelector(".products > div > h5");
    existH5 && container.removeChild(existH5);
    existSect && container.removeChild(existSect);
    container.appendChild(section);
  }
};

const fetchMax = async () => {
  const response = await fetch("/getproducts/max", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const {
    success,
    data: { max },
  } = await response.json();
  priceInput.max = max;
  if (priceInput.value > max) priceInput.value = max;
  priceDisplay.innerHTML = `$${priceInput.value
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
};

const render = async () => {
  const spinner = document.createElement("div");
  spinner.setAttribute("id", "spinner");
  container.appendChild(spinner);
  await fetchMax();
  await fetchProducts();
  container.removeChild(spinner);
};

clearBtn.addEventListener("click", () => {
  searchInput.value = "";
  categoryBtns[activeIndex].className = "null";
  activeIndex = 0;
  categoryBtns[activeIndex].className = "active";
  company.value = "";
  sortInput.value = "price-lowest";
  priceInput.value = priceInput.max;
  render();
});

company.addEventListener("change", () => render());

sortInput.addEventListener("change", () => render());

priceInput.addEventListener("input", () => render());

searchInput.addEventListener("input", () => render());

categoryBtns.forEach((button, index) => {
  if (index === activeIndex) button.className = "active";
  else button.className = "null";
  button.addEventListener("click", () => {
    categoryBtns[activeIndex].className = "null";
    activeIndex = index;
    categoryBtns[activeIndex].className = "active";
    render();
  });
});

viewBtns.forEach((btn, index) => {
  if (index === viewActive) btn.className = "active";
  else btn.className = "null";
  btn.addEventListener("click", () => {
    viewBtns[viewActive].className = "null";
    viewActive = index;
    viewBtns[viewActive].className = "active";
    render();
  });
});

window.onload = () => {
  render();
};
