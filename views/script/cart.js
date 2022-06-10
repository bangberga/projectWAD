const main = document.querySelector(".page"),
  sectionCenter = document.querySelector(".page .section-center"),
  subtotal = document.querySelector("[subtotal]"),
  shippingfee = document.querySelector("[shippingfee]"),
  ordertotal = document.querySelector("[ordertotal]"),
  cartValue = document.querySelector(".cart-value"),
  SHIPPING = 0,
  removeAllChildNodesByName = (parent, name) => {
    const start = parent.children[0];
    const removeChilds = (node) => {
      if (!node) return;
      removeChilds(node.nextSibling);
      if (node.nodeName.toLowerCase() === name.toLowerCase()) node.remove();
    };
    removeChilds(start);
  },
  renderCart = (function renderCart() {
    if (cart.length === 0) {
      const main = document.body.querySelector("main");
      main.innerHTML = `
      <div class="empty">
        <h2>Your cart is empty</h2>
        <a class="btn" href="/products">fill it</a>
      </div>
      `;
      main.setAttribute("class", "page-100");
      return;
    }
    removeAllChildNodesByName(sectionCenter, "article");
    let _cartvalue = 0;
    cart.forEach((item, index) => {
      const { name, price, discount, amount, image, color } = item;
      _cartvalue += amount;
      const cost = (price - price * discount).toFixed(2);
      const sub = (parseFloat(cost) * amount).toFixed(2);
      const article = document.createElement("article");
      article.innerHTML = `
    <div class="title">
      <img src="../images/${image}" alt"${name}" />
      <div>
        <h5>${name}</h5>
        <p class="color">
          color: <span style="background: ${color};"></span>
        </p>
        <h5 class="price-small">$${
          discount
            ? `<span class="discount">${price}</span> <span class="newprice">$${cost}<span class="percent">-${
                discount * 100
              }%</span></span>`
            : price
        }</h5>
      </div>
    </div>
    <h5 class="price">$${
      discount
        ? `<span class="discount">${price}</span> <span class="newprice">$${cost}<span class="percent">-${
            discount * 100
          }%</span></span>`
        : price
    }</h5>
    <div class="amount-btns" >
      <button type="button" class="amount-btn"><i class="bx bx-minus"></i></button>
      <h2 class="amount">${amount}</h2>
      <button type="button" class="amount-btn"><i class="bx bx-plus"></i></button>
    </div>
    <h5 class="subtotal">$${sub}</h5>
    <button class="remove-btn"><i class='bx bxs-trash-alt'></i></button>
  `;
      sectionCenter.insertBefore(article, sectionCenter.children[1 + index]);
    });
    cartValue.innerHTML = _cartvalue;
    const total = cart
      .reduce(
        (total, item) =>
          total +
          item.amount *
            parseFloat((item.price - item.price * item.discount).toFixed(2)),
        0
      )
      .toFixed(2);
    subtotal.innerHTML = `$${total}`;
    shippingfee.innerHTML = `$${SHIPPING}`;
    ordertotal.innerHTML = `$${(parseFloat(total) + SHIPPING).toFixed(2)}`;
    document.querySelectorAll(".bx-plus").forEach((btn, index) => {
      btn.addEventListener("click", () => {
        if (cart[index].amount < cart[index].max) ++cart[index].amount;
        localStorage.setItem("cart", JSON.stringify(cart));
        renderCart();
      });
    });
    document.querySelectorAll(".bx-minus").forEach((btn, index) => {
      btn.addEventListener("click", () => {
        if (cart[index].amount > 1) cart[index].amount--;
        localStorage.setItem("cart", JSON.stringify(cart));
        renderCart();
      });
    });
    document.querySelectorAll(".remove-btn").forEach((btn, index) => {
      btn.addEventListener("click", () => {
        cart.splice(index, 1);
        localStorage.setItem("cart", JSON.stringify(cart));
        renderCart();
      });
    });
    document.querySelector(".clear-btn").addEventListener("click", () => {
      cart = [];
      localStorage.setItem("cart", JSON.stringify(cart));
      renderCart();
    });
    return renderCart;
  })();
