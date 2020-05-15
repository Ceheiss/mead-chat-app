const socket = io();

const messageForm = document.getElementById("message-form");
const messageFormInput = messageForm.querySelector("input");
const messageFormButton = messageForm.querySelector("button");
const messages = document.getElementById("messages");

// Templates
const messageTemplate = document.getElementById("message-template").innerHTML;
const locationTemplate = document.getElementById("location-template").innerHTML;
const sidebarTemplate = document.getElementById("sidebar-template").innerHTML;

//Options
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});
const autoscroll = () => {
  // neMessage element
  const newMessage = messages.lastElementChild;
  // Height of newMessage
  const newMessageStyles = getComputedStyle(newMessage);
  const newMessageMargin = parseInt(newMessageStyles.marginBottom);
  const newMessageHeight = newMessage.offsetHeight + newMessageMargin;
  // Visible Height
  const visibleHeight = messages.offsetHeight;
  // Height of messages container
  const containerHeight = messages.scrollHeight;
  // How far have I scrolled?
  const scrollOffset = messages.scrollTop + visibleHeight;
  if (containerHeight - newMessageHeight <= scrollOffset) {
    messages.scrollTop = messages.scrollHeight;
  }
};

messageForm.addEventListener("submit", (e) => {
  e.preventDefault();
  // disable submit button
  messageFormButton.setAttribute("disabled", "disabled");
  const message = e.target.elements.message.value;
  socket.emit("sendMessage", message, (error) => {
    messageFormButton.removeAttribute("disabled");
    messageFormInput.value = "";
    messageFormInput.focus();
    if (error) {
      return console.log("Error: ", error);
    }
    return console.log("Message delivered");
  });
});

socket.on("message", (message) => {
  console.log(message);
  const html = Mustache.render(messageTemplate, {
    username: message.username,
    createdAt: moment(message.createdAt).format("h:mm a"),
    message: message.text,
  });
  messages.insertAdjacentHTML("beforeend", html);
  autoscroll();
});

socket.on("newLocationMessage", (location) => {
  const html = Mustache.render(locationTemplate, {
    username: location.username,
    location: location.url,
    createdAt: moment(location.createdAt).format("h:mm a"),
  });
  messages.insertAdjacentHTML("beforeend", html);
  autoscroll();
});

socket.on("roomData", ({ room, users }) => {
  const html = Mustache.render(sidebarTemplate, {
    room,
    users,
  });
  document.getElementById("sidebar").innerHTML = html;
});

const locationButton = document.getElementById("location-button");
locationButton.addEventListener("click", () => {
  locationButton.setAttribute("disabled", "disabled");
  if (!navigator.geolocation) {
    return alert("Geolocation is not supported by your browser :(");
  }
  navigator.geolocation.getCurrentPosition((position) => {
    const { latitude, longitude } = position.coords;
    socket.emit("locationMessage", { latitude, longitude }, () => {
      locationButton.removeAttribute("disabled");
      return console.log("location shared");
    });
  });
});

socket.emit("join", { username, room }, (error) => {
  if (error) {
    alert(error);
    location.href = "/";
  }
});
