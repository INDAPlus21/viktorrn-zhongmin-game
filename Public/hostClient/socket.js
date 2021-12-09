let socket = io(); // event listener/emitter

let roomId; // room id

let playerInfo = new Object();
/*
  playerInfo =
  {
    "player1": {
      "name": ...,
      "id": ...,
      "deck": [],
      "blood": 0
    },
    "player2": {
      ...
    }
  }
  Use a different object for common game stats like the damage scale maybe?
*/

let GAMESTATE = 'lobby';

socket.on('connect', () => {// run upon connection
  console.log("I'm online! with id " + socket.id);

  // this is only run once, when the host client connects
  socket.emit('createRoom', socket.id, (generated) => {
    roomId = generated;
    console.log(roomId);
    socket.join(roomId);
  });

  // playerClient's joinRoom -> server's isRoomOpen?
  socket.on('isRoomOpen?', (playerName, playerId, callback) => {
    let answer = new Array();
    answer[0] = false;

    answer[1] = (Object.keys(playerInfo).length > 1) ? "The room is full."
              : (GAMESTATE !== 'lobby') ? "The game has already started."
              : null;
    
    if (answer[1] === null) { // if none of the above failure conditions match, let the player in
      callback(answer); // tell the player they will be joining

      let playerObj = {'name': playerName, 'id': playerId, 'deck': [], 'blood': 0}

      if (playerInfo.player1 === undefined)
        playerInfo.player1 = playerObj;
      else
        playerInfo.player2 = playerObj;
    } else {
      answer[0] = true;
      callback(answer);
    }
  })

  socket.on('playerReady', (playerId, deck) => {

  });
});