const page = document.querySelector(".page");
const spinner = document.createElement("div");
spinner.setAttribute("id", "spinner");
const { id, name, email } = JSON.parse(
  document.querySelector("[data-user]").dataset.user
);
const SHIPPING = 0;
document.querySelector("[data-user]").removeAttribute("data-user");

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
}

const total = (
  cart.reduce(
    (total, item) =>
      total +
      item.amount *
        parseFloat((item.price - item.price * item.discount).toFixed(2)),
    0
  ) + SHIPPING
).toFixed(2);
(() => {
  if (!cart.length) {
    page.innerHTML = `
    <div class="empty">
        <h2>Your cart is empty</h2>
        <a class="btn" href="/products">fill it</a>
    </div>
    `;
  } else {
    page.innerHTML = `
    <section>
        <div>
          <article>
              <h4>Hello, ${name}</h4>
              <p>Your total is $${total}</p>
          </article>
          <form>
              <div>
                  <label for="phone">Phone Number</label>
                  <div>
                      <i class='bx bx-phone'></i>
                      <input type="text" name="phone" id="phone" required ${
                        getCookie("phone") && `value=${getCookie("phone")}`
                      } />
                  </div>
              </div>
              <div>
                  <label for="address">Address</label>
                  <div>
                      <i class='bx bx-map' ></i>
                      <input type="text" name="address" id="address" required ${
                        getCookie("address") &&
                        `value=${unescape(getCookie("address"))}`
                      } />
                  </div>
              </div>
              <div>
                  <label for="message">Message</label>
                  <div>
                      <textarea id="message" cols=30 rows=10 name="message" placeholder="Messages...">${
                        getCookie("message") !== undefined
                          ? unescape(getCookie("message"))
                          : ""
                      }</textarea>
                  </div>
              </div>
          </form>
          <div id="paypal"></div>
        </div>
      </section>
      `;
    const isValidPhoneNumber = (number) =>
      /(84|0[3|5|7|8|9])+([0-9]{8})\b/g.test(number);
    const phone = document.querySelector("#phone");
    const address = document.querySelector("#address");
    const message = document.querySelector("#message");
    const container = document.querySelectorAll(".page form > div");
    const phoneIn = document.createElement("strong");
    phoneIn.setAttribute("class", "fail");
    const phoneContainer = container[0];
    const addressIn = document.createElement("strong");
    addressIn.setAttribute("class", "fail");
    const addressContainer = container[1];
    const messageIn = document.createElement("strong");
    messageIn.setAttribute("class", "fail");
    const messageContainer = container[2];
    const MAXMESSAGE = 255;
    const MAXADDRESS = 100;
    let isExceed = false;

    message.oninput = () => {
      const strongMessage = messageContainer.querySelector("strong");
      strongMessage && messageContainer.removeChild(strongMessage);
      isExceed = false;
      if (message.value.length > MAXMESSAGE) {
        messageIn.innerHTML = "Message should be under 255 characters!";
        messageContainer.appendChild(messageIn);
        isExceed = true;
      }
    };
    address.oninput = () => {
      const strongAddress = addressContainer.querySelector("strong");
      strongAddress && addressContainer.removeChild(strongAddress);
      isExceed = false;
      if (address.value.length > MAXADDRESS) {
        addressIn.innerHTML = "Address should be under 100 characters!";
        isExceed = true;
        addressContainer.appendChild(addressIn);
      }
    };
    paypal
      .Buttons({
        onClick: (data, actions) => {
          const strongPhone = phoneContainer.querySelector("strong");
          strongPhone && phoneContainer.removeChild(strongPhone);
          if (!phone.value) {
            phoneIn.innerHTML = "Phone required!";
            phoneContainer.appendChild(phoneIn);
            return actions.reject();
          }
          if (!isValidPhoneNumber(phone.value)) {
            phoneIn.innerHTML = "Invalid phone number!";
            phoneContainer.appendChild(phoneIn);
            return actions.reject();
          }
          if (!address.value) {
            addressIn.innerHTML = "Address required!";
            addressContainer.appendChild(addressIn);
            return actions.reject();
          }
          if (isExceed) {
            return actions.reject();
          }
          const d = new Date();
          d.setTime(d.getTime() + 24 * 60 * 60 * 1000);
          let expires = "expires=" + d.toUTCString();
          document.cookie = `phone=${phone.value};${expires};path=/;`;
          document.cookie = `address=${escape(
            address.value
          )};${expires};path=/`;
          document.cookie = `message=${escape(
            message.value
          )};${expires};path=/`;
          page.appendChild(spinner);
          return fetch("/checkcart", {
            method: "POST",
            headers: {
              "content-type": "application/json",
            },
            body: JSON.stringify({ cart }),
          })
            .then((res) => res.json())
            .then((data) => {
              const { success, notEnoughItems, missing, message } = data;
              page.removeChild(spinner);
              if (success) return actions.resolve();
              let _msg = ``;
              if (notEnoughItems) {
                notEnoughItems
                  .slice(0, 5)
                  .forEach(
                    (item) =>
                      (_msg += `<p>${item.name} remains ${item.qty} items</p>`)
                  );
                if (notEnoughItems.length > 5) _msg += "<p>...</p>";
              }
              if (missing) {
                missing.slice(0, 5).forEach((item) => {
                  _msg += `<p>${item.name} is out of stock</p>`;
                });
                if (missing.length > 5) _msg += "<p>...</p>";
              }
              const div = document.createElement("div");
              div.classList.add("faildisplay");
              div.innerHTML = `
              <section>
                  <button class="close"><i class='bx bx-x'></i></button>
                  <h4>Message</h4>
                  <p>${message}</p>
                  ${_msg}
              </section>
              `;
              document.body.appendChild(div);
              document.querySelectorAll(".close").forEach((btn) => {
                btn.addEventListener("click", () => {
                  cart = cart.filter(
                    (cartItem) =>
                      !missing.find((item) => cartItem.id === item.id)
                  );
                  cart.forEach((cartItem) => {
                    const notEnoughItem = notEnoughItems.find(
                      (item) => cartItem.id === item.id
                    );
                    if (notEnoughItem) {
                      cartItem.amount = notEnoughItem.qty;
                      cartItem.max = notEnoughItem.qty;
                    }
                  });
                  localStorage.setItem("cart", JSON.stringify(cart));
                  window.location.reload();
                });
              });
              return actions.reject();
            });
        },

        createOrder: () => {
          return fetch("/checkout", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              cart,
              total,
            }),
          })
            .then((res) => {
              if (res.ok) return res.json();
              return res.json().then((json) => Promise.reject(json));
            })
            .then(({ id }) => {
              return id;
            })
            .catch((e) => {
              console.error(e.error);
            });
        },

        onApprove: (data, actions) => {
          return actions.order.capture().then((details) => {
            console.log(details);
            fetch("/checkout/approve", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                payment: "paypal",
                details,
                id,
                phone: phone.value,
                address: address.value,
                message: message.value,
                cart,
              }),
            })
              .then((response) => {
                if (response.ok) return response.json();
                return response.json().then((json) => Promise.reject(json));
              })
              .then((data) => console.log(data))
              .catch((error) => console.error(error));
            page.innerHTML = `<h3>Thank you for your payment!<h3>`;
            localStorage.setItem("cart", "[]");
            fetch("/sendthankyou", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ email }),
            })
              .then((res) => {
                if (res.ok) return res.json();
                return res.json().then((json) => Promise.reject(json));
              })
              .then((r) => console.log(r))
              .catch((e) => console.log(e));
          });
        },
      })
      .render("#paypal");
  }
})();
