fetch("/getproducts/newest", {
  method: "GET",
  headers: {
    "Content-Type": "application/json",
  },
})
  .then((res) => res.json())
  .then((json) => {
    const { success, data } = json;
    data.forEach((product) => {
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
        featuredContainer.appendChild(article);
    });
    featuredContainer.removeChild(spinner);
  });
const featuredContainer = document.querySelector(".featured");
const spinner = document.createElement("div");
spinner.setAttribute("id", "spinner");
featuredContainer.appendChild(spinner);
