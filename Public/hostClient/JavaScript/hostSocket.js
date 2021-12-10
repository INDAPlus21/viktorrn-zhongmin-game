function $(el) { return document.getElementById(el) };

let socket = io(); // event listener/emitter
let socketId; // the client's unique id for the socket connection
let roomId; // room id
let playerInfo = new Object();

let GAMESTATE = 'lobby';

let boardInfo = {
  player1: [
    {
      name: 'Starvation',
      health: '6',
      power: '6',
      sigil: ['air'],
      age: '0'
    },
    null,
    null,
    null
  ],
  player2: [
    null,
    null,
    null,
    null
  ]
}

function isPlayer (playerId) {
  if (playerInfo.player1.id === playerId) return 1;
  else if (playerInfo.player2.id === playerId) return 2;
  else return false;
}

function shuffle (array) {
  let currentIndex = array.length,  randomIndex;

  // While there remain elements to shuffle...
  while (currentIndex != 0) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }

  return array;
}

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

      let playerObj = {name:playerName, id:playerId, originalDeck:[], remainingDeck:[], hand:[], blood:0}

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
    try{
      if (isPlayer(playerId)===1) {
        playerInfo.player1.originalDeck = deck;
        $('player1State').innerHTML = `<span>${playerInfo.player1.name}</span><br><b>READY!</b>`
      }
      if (isPlayer(playerId)===2) {
        playerInfo.player2.originalDeck = deck;
        $('player2State').innerHTML = `<span>${playerInfo.player2.name}</span><br><b>READY!</b>`
      }

    // check if game can start // cheep as error handling, yes box
    
    if (playerInfo.player1.originalDeck.length !== 0 && playerInfo.player2.originalDeck.length !== 0){
    // copy original deck to remaining deck for the game
      playerInfo.player1.remainingDeck = shuffle(playerInfo.player1.originalDeck);
      playerInfo.player2.remainingDeck = shuffle(playerInfo.player2.originalDeck);
      // start this mf
      //starts with giving player 1 the cards and then prompting
      socket.emit('startGame', roomId, playerInfo.player1.playerId);
      socket.emit('syncHand', roomId, playerInfo.player1.playerId,playerInfo.player1.remainingDeck)
      GAMESTATE = 'ingame';
      $('bodyPregame').classList.remove('onscreen');
      $('bodyIngame').classList.add('onscreen');
    }
    }catch{}
  });

  socket.on('playerDrawCard', (playerId, callback) => {
    let remaining = playerInfo['player'+isPlayer(playerId)].remainingDeck;
    // @hex, you only need to shuffle once, on the StartTurn event as its allways called prior to this event
    let card = remaining.shift(); // the card that was drawn - undefined if empty

    callback(card); // send the card back for stuff like animations?

    playerInfo['player'+isPlayer(playerId)].hand.push(remaining.shift()); // get first element of deck, remove first element from deck

    socket.emit('syncHand')
  });

  socket.on('playerEndTurn', (playerId) => {
    if (playerInfo.player1.id === playerId) {
    }
    if (playerInfo.player2.id === playerId) {
    }
  });
});