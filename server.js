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

    //console.log("New room created with ID: "+id);

    //console.log(roomList);

    callback(id);
  });

  // event from player: player attempts to join room. playerId is player client's socket id
  // the callback function responds with whether the player is ok join or not.
  // the player will join a socket.io room with the same id as the room's join code, for ease of broadcast.
  socket.on('joinRoom', (roomId, username, playerId, callback) => {
    if (roomList[roomId] === undefined) // if no such room
      callback('fail', 'Room does not exist.'); // back to sender

    else {
      let hostSocket = io.sockets.sockets.get(hostOf(roomId)); //this allows you to emit with callback - THANKS STACKOVERFLOW!!!!
      hostSocket.emit('isRoomOpen?', username, playerId, (answer) => {

        if (answer[0] === true) // first element: whether it's closed or not
          callback('fail', answer[1]); // second element: reason of close
        else
          callback('success');
          // the host client will have already added the player to the database back in the 'isRoomOpen?' event

          //console.log('player '+playerId+' has joined room '+roomId)
      });
    }

  });

  // event from player: body onunload, notify host.
  // NOTE: not working yet
  socket.on('leaveRoom', (roomId, playerId) => {
    socket.to(hostOf(roomId)).emit('playerLeft', playerId);
  })

  socket.on('playerSelectedCards' , (roomId,playerId,deck) => {
    socket.to(hostOf(roomId)).emit('playerSelectedCards', playerId, deck);
  })

  // event from player: player has assembled their deck and is ready to start the round.
  // this action cannot be undone.
  socket.on('ready', (roomId, playerId) => {
    socket.to(hostOf(roomId)).emit('playerReady', playerId);
  });



  // event from host: both players have locked in their decks: change player's UI to game field, and the player with firstPlayerId starts their round first.
  socket.on('startGame', (roomId, firstPlayerId, secondPlayerId) => { 
    socket.to(firstPlayerId).emit('startGame');
    socket.to(secondPlayerId).emit('startGame');
    //socket.to(firstPlayerId).emit('startTurn', playerBoard, canDrawCard);
  });

  // event from player: player either draws a card from their deck, or a squirrel.
  socket.on('playerDrawCard', (roomId, playerId, drawnCard) => {
    socket.to(hostOf(roomId)).emit('playerDrawCard', playerId, drawnCard);
  });

  // event from host: the specified player starts their turn.
  socket.on('startTurn', (playerId, turn) => {
    socket.to(playerId).emit('startTurn', turn);
  });

  // event from host: the player's hand is updated with the list from the host, to eliminate desync issues.
  // this is triggered in multiple places.
  socket.on('syncClient', (playerObj, board, redrawUI) => {
    let id = playerObj.id;
    let hand = playerObj.hand;
    let blood = playerObj.blood;
    let deck = playerObj.remainingDeck;
    socket.to(id).emit('syncClient', hand, board, blood, deck, redrawUI);
  });

 // event from player: player is ending turn
  socket.on('playerEndTurn', (roomId, playerId) => {
    //console.log('player '+playerId+' has ended their turn in '+roomId+'. Over to you, '+hostOf(roomId))
    socket.to(hostOf(roomId)).emit('playerEndTurn', playerId);
  });

  // event from player: player is playing a card on the field.
  socket.on('playerPlayCard', (roomId, playerId, cardIndex, column) => {
    socket.to(hostOf(roomId)).emit('playerPlayCard', playerId, cardIndex, column);
  });
  // did
  // event from player: player is sacrificing a card on the field and should receive 1 blood.
  socket.on('playerSacrificeCard', (roomId, playerId, column) => {
    socket.to(hostOf(roomId)).emit('playerSacrificeCard', playerId, column);
  });

  //when a round is over
  socket.on('endOfRound' , (player1Id, p1Deck ,player2Id, p2Deck) => {
    socket.to(player1Id).emit('endOfRound',p1Deck);
    socket.to(player2Id).emit('endOfRound',p2Deck);
  })

  // event from host: the game has ended, the specified player display that they won, the other player that they lost.
  socket.on('endGame', (winnerPlayerId, loserPlayerId) => {
    socket.to(winnerPlayerId).emit('youWin');
    socket.to(loserPlayerId).emit('youLose');
  })

  // event from player: player is sending a very angry letter to be displayed on the host screen
  socket.on('chat', (playerId, roomId, msg) => {
    socket.to(hostOf(roomId)).emit('chat',playerId,msg);
    //console.log('Player '+playerId+' wrote: '+msg)
  })
});

http.listen(5001, function(){ // set port
  console.log('listening on *:5001');
});
