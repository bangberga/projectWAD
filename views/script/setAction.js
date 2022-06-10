const editBtns = document.querySelectorAll(".editBtn");
const deleteBtns = document.querySelectorAll(".deleteBtn");
const submitBtn = document.querySelector(".submitBtn");
const main = document.querySelector("main");
const type = main.dataset.type;
main.removeAttribute("data-type");
const rows = document.querySelectorAll(".row");
const discountContainer = document.querySelector("[discount]");
const checkValidation = (e, display, percent) => {
  percent = parseFloat(percent);
  discountContainer.querySelector("strong") &&
    discountContainer.removeChild(discountContainer.querySelector("strong"));
  if (isNaN(percent)) {
    e.preventDefault();
    display.innerHTML = "You need to input a percent number";
    discountContainer.appendChild(display);
  }
  if (percent > 100 || percent < 0) {
    e.preventDefault();
    display.innerHTML = "Your percent is between 0 and 100 !";
    discountContainer.appendChild(display);
  }
};
submitBtn.addEventListener("click", (e) => {
  if (type !== "Discount") return;
  let percent = document.querySelector("#percent").value;
  if (percent[percent.length - 1] === "%")
    percent = percent.slice(0, percent.length - 1);
  const display = document.createElement("strong");
  display.setAttribute("class", "fail");
  checkValidation(e, display, percent);
});
deleteBtns.forEach((deleteBtn, index) => {
  deleteBtn.addEventListener("click", (e) => {
    const tds = rows[index].querySelectorAll("td");
    const id = tds[0].innerHTML;
    e.target.parentNode.value = id;
  });
});
editBtns.forEach((editBtn, index) => {
  editBtn.addEventListener("click", () => {
    const tds = rows[index].querySelectorAll("td");
    const id = tds[0].innerHTML;
    const name = tds[1].innerHTML;
    const percent = tds[2].innerHTML;
    if (document.querySelector(".editform"))
      document.body.removeChild(document.querySelector(".editform"));
    const editform = document.createElement("div");
    editform.setAttribute("class", "form-section edit");
    editform.innerHTML = `
    <section>
      <div class="header"><button type="button" class="close-btn"><i class='bx bx-x'></i></button></div>
      <form action="/admin/addProduct/update${type}?_method=PUT" method="POST">
        <div>
          <label for="editedName">New name:</label>
          <div class="normal">
            <i class='bx bx-edit-alt' ></i>
            <input type="text" name="editedName" value="${name}" required />
          </div>
        </div>
        ${
          type === "Discount"
            ? `<div editdiscount><label for="editedPercent">New percent value:</label>
          <div class="normal">
            <i class='bx bxs-discount' ></i>
            <input type="text" name="editedPercent" value="${percent}" class="editPercent" />
          </div>
          <strong class="editValid"></strong></div>`
            : ""
        }
        <button type="submit" name="updatedID" class="doneBtn btn">Done</button>
      </form>
    </section>  
      `;
    main.appendChild(editform);
    document.querySelector(".doneBtn").addEventListener("click", (e) => {
      e.target.value = id;
      if (type !== "Discount") return;
      let percent = document.querySelector(".editPercent").value;
      if (percent[percent.length - 1] === "%")
        percent = percent.slice(0, percent.length - 1);
      const display = document.querySelector(".editValid");
      checkValidation(e, display, percent);
    });
    editform.querySelector(".close-btn").addEventListener("click", () => {
      console.log("call");
      main.removeChild(editform);
    });
  });
});
