// obligatory
const express = require('express') // create module
let app = express(); // create an express object
const http = require('http').Server(app);
const io = require('socket.io')(http);

app.use(express.static(__dirname + '/Public')); // exposes the 'public' dir as the frontend's root dir - thanks stackoverflow

let roomList = {};
/*an object with room IDs as key, and an array of two elements as value.
  [0] the unix timestamp for when to free up the room ID. + 1 hour of any actions done.
  [1] the unique socket identifier for the client hosting the room.
*/

function randomRoomId() { // generates a random 4-letter code for joining
  let letters = 'abcdefghijklmnopqrstuvwxyz';
  let code = '';
  for (let i=0; i<4; i++) {
    code += letters.charAt(Math.floor(Math.random() * letters.length));
  }
  return code;
}

function hostOf(roomId) {
  return roomList[roomId][1];
}

io.on('connection', (socket) => { // server is online

  // event from host: host creates a new room. hostId is the unique socket id of the hosting client
  // the callback function responds with the valid room id.
  socket.on('createRoom', (hostId, callback) => {

    for (const id in roomList) { // force delete all expired ids
      if ( roomList[id] < Date.now() ) delete roomList[id];
    }

    let id;

    do
      id = randomRoomId(); // generate new id
    while (Object.keys(roomList).includes(id)); // repeat until id is unique

    roomList[id] = new Array();
    roomList[id][0] = Date.now() + 3600000 // add 1 hour to current timestamp
    roomList[id][1] = hostId;

    console.log("New room created with ID: "+id);

    callback(id);
  });

  // event from player: player attempts to join room. playerId is player client's socket id
  // the callback function responds with whether the player is ok join or not.
  // the player will join a socket.io room with the same id as the room's join code, for ease of broadcast.
  socket.on('joinRoom', (roomId, username, playerId, callback) => { 

    if (roomList[roomId] === undefined) // if no such room
      callback('fail', 'Room does not exist.'); // back to sender

    else {
      socket.to(hostOf(roomId)).emit('isRoomOpen?', username, playerId, (answer) => {

        if (answer === true)
          callback('fail', 'Could not join room. It may be full, ingame, or the same name/client is already inside.');
        else
          callback('success');
          // the host client will have already added the player to the database back in the 'isRoomOpen?' event
      });
    }

  });

  // event from player: body onunload, notify host.
  socket.on('leaveRoom', (roomId, playerId) => {
    socket.to(hostOf(roomId)).emit('playerLeft', playerId);
  })

  // event from player: player has assembled their starting deck and is ready to start.
  // this action cannot be undone.
  socket.on('ready', (roomId, playerId, deck) => {
    socket.to(hostOf(roomId)).emit('playerReady', playerId, deck);
  });

  // event from host: both players have locked in their decks: change player's UI to game field.
  socket.on('startGame', (roomId) => {
    socket.to(roomId).except(hostOf(roomId)).emit('startGame');
  })

  // event from player: player is playing a card on the field.
  socket.on('playCard', (roomId, playerId, card, column) => {

  });


});

http.listen(5000, function(){ // set port
  console.log('listening on *:5000');
});
