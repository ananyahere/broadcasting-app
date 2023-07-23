console.log("client side chat.js is loaded!");

// Make connection
var socket = io.connect("http://localhost:8080");

// Query DOM
var message = document.getElementById("message"),
  handle = document.getElementById("handle"),
  url = document.getElementById("url"),
  btn = document.getElementById("send"),
  output = document.getElementById("output");

// Emit events
btn.addEventListener("click", function () {
  socket.emit("chat", {
    message: message.value,
    handle: handle.value,
    url: url.value,
  });
  message.value = "";
});

// Listen for events
socket.on("chat", function (data) {
  output.innerHTML +=
    "<p><strong>" +
    data.handle +
    ": <br> </strong>" +
    data.message +
    "<br>" +
    "<a href=" +
    data.url +
    ">meet-link </a> </p>";
});
