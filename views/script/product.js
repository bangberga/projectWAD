fetch("/getproduct", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    id: window.location.pathname.split("/").pop(),
  }),
})
  .then((res) => {
    if (res.ok) return res.json();
    return res.json().then((json) => Promise.reject(json));
  })
  .then((data) => {
    const {
      id,
      product_name,
      image_link,
      image_list,
      viewed,
      discount,
      discount_id,
      price,
      description,
      status,
      SKU,
      company_name,
      color_list,
      qty,
    } = data.product;
    let images = `<img src="../images/${image_link}" style="opacity: 0;" />`;
    JSON.parse(image_list).forEach(
      (item) =>
        (images += `<img src="../images/${item}" style="opacity: 0;" />`)
    );
    const colors = JSON.parse(color_list);
    let listColorBtns = "";
    colors.forEach(
      (color) =>
        (listColorBtns += `<button class="color-btn" style="background-color: ${color};"></button>`)
    );
    const page = `
      <section  class="page-hero">
        <div class="section-center">
          <h3>
            <a href="/">Home </a><a href="/products">/ Products</a> / ${product_name}
          </h3>
        </div>
      </section>
      <div class="section section-center page">
        <a href="/products" class="btn">back to products</a>
        <div class="product-center">
          <section class="gallery-section">
            <img alt="${product_name}" class="main" style="opacity: 0;" />
            <div class="gallery">
              ${images}
            </div>
          </section>
          <section class="content">
            <h2>${product_name}</h2>
            <p class="view"><i class='bx bx-low-vision'></i> ${viewed} customers view</p>
            ${
              !discount
                ? `<h5 class="price">$${price}</h5>`
                : `<h5 class="price">
                      <span class="discount">$${price}</span>
                      <span class="newprice">
                          $${(price - price * discount).toFixed(2)}
                          <span class="percent">-${discount * 100}%</span>
                      </span>
                  </h5>`
            }
            <p class="desc">${description}</p>
            <p class="info"><span>Available: </span>${status}</p>
            <p class="info"><span>SKU: </span>${SKU}</p>
            <p class="info"><span>Brand: </span>${company_name}</p>
            <hr />
            <section>
              <div class="colors">
                <span>Colors: </span>
                <div>
                  ${listColorBtns}
                </div>
              </div>
              <div class="btn-container">
                <div class="amount-btns">
                  <button type="button" class="amount-btn">
                    <i class="bx bx-minus"></i>
                  </button>
                  <h2 class="amount">${qty > 0 ? 1 : 0}</h2>
                  <button type="button" class="amount-btn">
                    <i class="bx bx-plus"></i>
                  </button>
                </div>
                ${
                  qty > 0
                    ? '<a href="/cart" class="btn" addtocart>add to cart</a>'
                    : ""
                }
              </div>
            </section>
          </section>
        </div>
      </div>
    `;
    main.innerHTML = page;
    const addToCartBtn = document.querySelector("[addtocart]");
    const colorsBtns = document.querySelectorAll(".color-btn");
    let activeColorIndex = 0;
    const minus = document.querySelector(".bx-minus");
    const plus = document.querySelector(".bx-plus");
    const amount = document.querySelector(".amount");
    let count = parseInt(amount.innerHTML);
    const gallery = document.querySelectorAll(".gallery img");
    let activeImageIndex = 0;
    const mainImg = document.querySelector(".gallery-section .main");

    minus.addEventListener("click", () => {
      if (count <= 1) return;
      amount.innerHTML = --count;
    });

    plus.addEventListener("click", () => {
      if (count >= qty) return;
      amount.innerHTML = ++count;
    });

    gallery.forEach((img, index) => {
      if (index === activeImageIndex) {
        img.className = "active";
        mainImg.src = img.src;
      } else img.className = "null";
      img.addEventListener("click", () => {
        mainImg.src = img.src;
        gallery[activeImageIndex].className = "null";
        activeImageIndex = index;
        gallery[activeImageIndex].className = "active";
      });
    });

    colorsBtns[activeColorIndex].classList.add("active");
    colorsBtns[activeColorIndex].innerHTML = `<i class='bx bx-check'></i>`;
    colorsBtns.forEach((colorBtn, index) => {
      colorBtn.addEventListener("click", () => {
        colorsBtns[activeColorIndex].classList.remove("active");
        colorsBtns[activeColorIndex].innerHTML = "";
        activeColorIndex = index;
        colorsBtns[activeColorIndex].classList.add("active");
        colorsBtns[activeColorIndex].innerHTML = `<i class='bx bx-check'></i>`;
      });
    });

    addToCartBtn?.addEventListener("click", () => {
      let cart = [];
      if (localStorage.getItem("cart"))
        cart = JSON.parse(localStorage.getItem("cart"));
      const existItem = cart.find(
        (item) => item.id === id && item.color === colors[activeColorIndex]
      );
      if (existItem) {
        const newAmount = existItem.amount + count;
        existItem.amount = newAmount > qty ? qty : newAmount;
        existItem.max = qty;
        existItem.name = product_name;
        existItem.discount = discount;
        existItem.discount_id = discount_id;
        localStorage.setItem("cart", JSON.stringify(cart));
        return;
      }
      const newItem = {
        id,
        name: product_name,
        amount: count,
        color: colors[activeColorIndex],
        max: qty,
        price,
        discount,
        discount_id,
        image: image_link,
      };
      cart.push(newItem);
      localStorage.setItem("cart", JSON.stringify(cart));
    });
    main.querySelector("#spinner") && main.removeChild(spinner);
    main.querySelectorAll("img").forEach(
      (img) =>
        (img.onload = () => {
          img.style.opacity = 1;
          img.removeAttribute("style");
        })
    );
    const timerId = setInterval(() => {
      gallery[activeImageIndex].className = "null";
      if (activeImageIndex === gallery.length - 1) activeImageIndex = 0;
      else ++activeImageIndex;
      gallery[activeImageIndex].className = "active";
      mainImg.src = gallery[activeImageIndex].src;
    }, 5000);
  })
  .catch((e) => console.error(e));

const main = document.querySelector("main");
const spinner = document.createElement("div");
spinner.setAttribute("id", "spinner");
main.appendChild(spinner);
