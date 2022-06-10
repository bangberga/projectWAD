const messages = document.querySelectorAll(".message");
messages.forEach((message) => {
  const _ = message.innerHTML;
  if (message.innerHTML.length > 200) {
    const readbtn = document.createElement("button");
    const hidebtn = document.createElement("button");
    readbtn.innerHTML = "read more...";
    hidebtn.innerHTML = "Show less.";
    readbtn.setAttribute("class", "text-btn");
    hidebtn.setAttribute("class", "text-btn");
    readbtn.addEventListener("click", () => {
      message.innerHTML = _;
      message.appendChild(hidebtn);
    });
    hidebtn.addEventListener("click", () => {
      message.innerHTML = _.slice(0, 200);
      message.appendChild(readbtn);
    });
    message.innerHTML = _.slice(0, 200);
    message.appendChild(readbtn);
  }
});
