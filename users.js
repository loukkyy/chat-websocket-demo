const USERS = []

function addUser(id, username, room) {
  const user = { id, username, room }
  USERS.push(user)
  console.log(`${user.username} has been added to room ${user.room}`)
  return user
}

function removeUser(id) {
  const user = USERS.find((user) => user.id === id)
  const index = USERS.indexOf(user)
  if (index > -1) {
    console.log(`${user.username} has been removed from room ${user.room}`)
    return USERS.splice(index, 1)[0]
  }
}

function getUsersByRoom(room) {
  return USERS.filter((user) => user.room === room)
}

function getCurrentUser(id) {
  return USERS.find((user) => user.id === id)
}

module.exports = {
  addUser,
  removeUser,
  getCurrentUser,
  getUsersByRoom,
}
