window.onload = () => {
  const confirm = document.querySelector("#confirm");
  confirm.addEventListener("paste", (e) => e.preventDefault());
  confirm.addEventListener("drop", (e) => e.preventDefault());
};
