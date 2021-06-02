const $usernameForm = document.querySelector("#username-form")
$usernameForm.addEventListener("submit", (e) => {
  e.preventDefault()
  const { username, room } = e.target.elements
  location.assign(
    `chat-room.html?username=${username.value}&room=${room.value}`
  )
})
