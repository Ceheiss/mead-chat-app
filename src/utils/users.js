const users = [];

// addUser, removeUser, getUser,  getUsersInRoom

const addUser = ({ id, username, room }) => {
  // Clean the data
  username = username.trim().toLowerCase();
  room = room.trim().toLowerCase();
  // Validate the data
  if (!username || !room) {
    return {
      error: "username and room are required!",
    };
  }
  // Check for existing user
  const existingUser = users.find((user) => {
    return user.room === room && user.username === username;
  });
  // Validate username
  if (existingUser) {
    return {
      error: "Username is in use!",
    };
  }
  // Store user
  const user = { id, username, room };
  users.push(user);
  return { user };
};

// addUser({
//   id: 30,
//   username: "ceheiss",
//   room: "chinobili",
// });

// addUser({
//   id: 20,
//   username: "Zack",
//   room: "chinobili",
// });

const removeUser = (id) => {
  const index = users.findIndex((user) => user.id === id);
  // result is a number
  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
};

// removeUser(30)

const getUser = (id) => users.filter((user) => user.id === id)[0];
// console.log(getUser(20));
// console.log(getUser(21));

const getUsersInRoom = (room) => users.filter((user) => user.room === room);
// console.log(getUsersInRoom('chinobili'));
// console.log(getUsersInRoom('adq'));

module.exports = {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
};
