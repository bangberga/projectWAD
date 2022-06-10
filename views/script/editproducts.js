const main = document.querySelector("main");
function deleteProduct(id) {
  const deleteform = document.createElement("div");
  deleteform.setAttribute("class", "form-section delete");
  deleteform.innerHTML = `<section>
      <form action="/admin/editProducts/delete/${id}?_method=DELETE" method="POST">
        <h3>Do you want to delete this?</h3>
        <p>All products that client ordered will disapear</p>
        <div class="btn-container">
            <button type="submit" class="delete-btn btn" name="deleteID" value="${id}">Delete</button>
            <button type="button" class="cancel-btn btn">Cancel</button>
        </div>
      </form>
    </section>
    `;
  deleteform
    .querySelector(".cancel-btn")
    .addEventListener("click", () => deleteform.remove());
  main.appendChild(deleteform);
}
