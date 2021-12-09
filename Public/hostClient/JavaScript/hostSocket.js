function $(el) { return document.getElementById(el) };

let socket = io(); // event listener/emitter
let socketId; // the client's unique id for the socket connection
let roomId; // room id
let playerInfo = new Object();

let GAMESTATE = 'lobby';

// socket connection
socket.on('connect', () => {// run this when connected
  console.log("I'm online! with id " + socket.id);
  socketId = socket.id;

  // this is only run once, when the host client connects
  socket.emit('createRoom', socket.id, (generated) => {
    roomId = generated;
    console.log(roomId);
    $('roomCode').innerHTML = `Join the game at:<h1>${roomId.toUpperCase()}</h1>`;
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

      if (playerInfo.player1 === undefined) {
        playerInfo.player1 = playerObj;
        $('player1State').innerHTML = `<span>${playerName}</span><br><i>Not ready</i>`
      } else {
        playerInfo.player2 = playerObj;
        $('player2State').innerHTML = `<span>${playerName}</span><br><i>Not ready</i>`
      }
    } else {
      answer[0] = true;
      callback(answer);
    }
  })

  socket.on('playerReady', (playerId, deck) => {
    if (playerInfo.player1.id === playerId) {
      playerInfo.player1.deck = deck;
      $('player1State').innerHTML = `<span>${playerName}</span><br><b>READY!</b>`
    }
    if (playerInfo.player2.id === playerId) {
      playerInfo.player2.deck = deck;
      $('player1State').innerHTML = `<span>${playerName}</span><br><b>READY!</b>`
    }

    // check if game can start
    let deck1 = playerInfo.player1.deck
    let deck2 = playerInfo.player2.deck
    if (deck1 !== undefined && deck1.length !== 0 && deck2 !== undefined && deck2.length !== 0) {
      socket.emit('startGame', roomId)
    }
  });
});