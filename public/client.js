const socket = io()

// set username
const url = new URL(location.href)
const username = url.searchParams.getAll("username")[0] || "anonymous"

// set room
const room = url.searchParams.getAll("room")[0] || "global"

const $chatMessages = document.querySelector("#chat-messages")
const $roomTitle = document.querySelector("#room-title")
$roomTitle.innerText = `Welcome to chat room ${room}`
socket.emit("joinRoom", { username, room })

socket.on("connect", () => {
  console.log(`Connected to websocket with id: ${socket.id}`)
  socket.emit("join-room", { username, room }, (message, users) => {
    // update connected user list
    updateConnectedUsers(users)
    // display welcome message
    displayMessage(
      { username: "ChatBot", message, datetime: null },
      true,
      false
    )
  })
})

socket.on("disconnect", () => {
  console.log(`User ${username} disconnected`)
})

socket.on("message", ({ username, message, datetime, clientId, users }) => {
  // update connected user list
  updateConnectedUsers(users)
  // display chat bot message
  const isSender = socket.id === clientId
  const isBot = username === "ChatBot"
  displayMessage({ username, message, datetime }, isBot, isSender)
  // scroll down
  $chatMessages.scrollTop = $chatMessages.scrollHeight
})

const $chatForm = document.querySelector("#chat-form")
$chatForm.addEventListener("submit", (e) => {
  e.preventDefault()
  const messageInput = e.target.elements.message
  const message = messageInput.value

  if (message === "") return
  const messageId = displayMessage(
    { username, message, datetime: null },
    false,
    true
  )

  // set status if is sender
  setMessageStatus(false, messageId)

  // scroll down
  $chatMessages.scrollTop = $chatMessages.scrollHeight

  // reset input
  messageInput.value = ""

  // emit chat message to server
  socket.emit("send-message", message, (isMessageSent) => {
    console.log("isSent:", isMessageSent)
    setMessageStatus(isMessageSent, messageId)
  })
})

function displayMessage({ username, message, datetime }, isBot, isSender) {
  const $messageTemplate = document.querySelector("#message-template")
  const $messageClone = $messageTemplate.content.cloneNode(true)
  const $messageContainer = $messageClone.querySelector("[data-message]")
  const $header = $messageContainer.querySelector("[data-message-header]")
  const $text = $messageContainer.querySelector("[data-message-text]")
  const datetimeClient = new Date()
  $header.innerText = `${username} wrote at ${datetimeClient.toLocaleString()}:`
  $text.innerText = message

  // position message depending of source
  if (isBot) {
    $messageContainer.classList.add("message-stretch")
  } else if (isSender) {
    $messageContainer.classList.add("message-float-left")
  } else {
    $messageContainer.classList.add("message-float-right")
  }

  // add message id to data attribute
  const messageId = datetimeClient.getUTCMilliseconds()
  $messageContainer.dataset.id = messageId

  $chatMessages.append($messageContainer)

  return messageId
}

function setMessageStatus(isMessageSent, messageId) {
  const $messages = [...$chatMessages.querySelectorAll("[data-message]")]
  const $message = $messages.find((message) => message.dataset.id == messageId)

  if ($message) {
    let $status = $message.querySelector("[data-message-status")
    if (!$status) {
      $status = document.createElement("small")
      $status.classList.add("badge", "bg-info", "text-dark")
      $status.dataset.messageStatus = ""
    }
    $status.innerText = isMessageSent === true ? "Sent" : "Not Sent"
    $status.classList.toggle("bg-success", isMessageSent)
    $status.classList.toggle("bg-info", !isMessageSent)
    $message.append($status)
  }
}

function updateConnectedUsers(users) {
  const $count = document.querySelector("[data-connected-users-count]")
  const $userList = document.querySelector("[data-connected-users-dropdown]")
  // update count
  $count.innerText = users.length
  // set user list
  $userList.innerHTML = ""
  users.forEach((user) => {
    const $userItem = document.createElement("li")
    $userItem.innerHTML = `<a class="dropdown-item" href="#">${user.username}</a>`
    $userList.append($userItem)
  })
}

document.addEventListener("keydown", (e) => {
  if (e.target.matches("#input-message")) return
  if (e.key === "c") socket.connect()
  if (e.key === "d") socket.disconnect()
})
