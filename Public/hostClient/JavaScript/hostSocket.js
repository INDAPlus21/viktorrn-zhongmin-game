import * as UIHandler from './uiHandler.js';
import * as DataManagerImport from '../../dataManager/dataManager.js';

let socket = io(); // event listener/emitter
let socketId; // the client's unique id for the socket connection
let roomId; // room id
let playerInfo = new Object();

let GAMESTATE = 'lobby';

let boardInfo = {
  player1: [
    null,
    null,
    null,
    null
  ],
  player2: [
    null,
    null,
    null,
    null
  ],
  turn: 0,
  p1damage: 0,
  p2damage: 0
}

let UI_Handler = new UIHandler.UIHandler($('cardSelectionPage'),$('cardPickZone'));
let DataManager = new DataManagerImport.DataManager();


window.onload = function(){
  DataManager.parseCardDataFromJSON(DataManager.jsonPath+'cards.json',DataManager,()=>{});
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
    
      if (playerInfo.player1.originalDeck.length > 0 && playerInfo.player2.originalDeck.length > 0) {
      // copy original deck to remaining deck for the game
        playerInfo.player1.remainingDeck = shuffle(playerInfo.player1.originalDeck);
        playerInfo.player2.remainingDeck = shuffle(playerInfo.player2.originalDeck);
        // start this mf
        //starts with giving player 1 the cards and then prompting
        let turn = 0;
        UI_Handler.displayBoard(boardInfo);
        socket.emit('startGame', roomId, playerInfo.player1.id, playerInfo.player2.id);
        socket.emit('syncClient', playerInfo.player1.id, playerInfo.player1.remainingDeck, boardInfo.player1, playerInfo.player1.blood);
        socket.emit('startTurn', playerInfo.player1.id, turn);
        GAMESTATE = 'ingame';
        $('bodyPregame').classList.remove('onscreen');
        $('bodyIngame').classList.add('onscreen');
      }
    }catch (error) {
      console.log(error);
      console.log(playerInfo);
    }
  });

  socket.on('playerDrawCard', (playerId, callback) => {
    let remaining = playerInfo['player'+isPlayer(playerId)].remainingDeck;
    let card = remaining.shift(); // the card that was drawn - undefined if empty
    callback(card); // send the card back for stuff like animations?

    let i = isPlayer(playerId);
    playerInfo['player'+i].hand.push(remaining.shift()); // get first element of deck, remove first element from deck
    let hand = playerInfo['player'+i].hand; // new hand
    socket.emit('syncClient', playerId, hand, boardInfo['player'+i], playerInfo['player'+i].blood); // refresh the client with new data
  });

  socket.on('playerPlayCard', (playerId, cardIndex, column) => {
    let i = isPlayer(playerId); // get which player it is
    let cardName = playerInfo['player'+i].hand[cardIndex]; // get the name of the card being played
    playerInfo['player'+i].hand.splice(cardIndex, 1); // remove the card from the player's hand
    let card = DataManagerImport.getSpecificCard(cardName); // extract the card data from the card's name

    boardInfo['player'+i][column] = card; // add that card to the board
    delete boardInfo['player'+i][column].cost; // cost is irrelevant to boardInfo since it's already placed out
    boardInfo['player'+i][column].age = 0; // how long the card has been on the board

    let hand = playerInfo['player'+i].hand; // new hand
    socket.emit('syncClient', playerId, hand, boardInfo['player'+i], playerInfo['player'+i].blood); // refresh the client with new data

    UI_Handler.displayBoard(boardInfo);
  });

  // big calculations in here!!!!
  socket.on('playerEndTurn', async (playerId) => {
    let i = isPlayer(playerId); // get which player it is
    let n = i===1 ? 2 : 1; // get the number of the opposite player

    for (let k=0; k<4; k++) { // loop through all 4 columns

      let thisCard = boardInfo['player'+i][k]; // the card at this position
      if (thisCard === null) continue; // if there is no card here, continue to the next column

      else { // if there IS a card here
        if (thisCard.age > 0) { // and it can attack
          let opposingCard = boardInfo['player'+n][k]; // get the opposing card

          if (opposingCard === null || thisCard.sigil.includes('air')) {
            p1damage += thisCard.power; // if there is no card opposing it OR if this card ignores opposing cards, attack the player
          } else {
            opposingCard.health -= thisCard.power; // attack the opposing card
            if (opposingCard.health <= 0) boardInfo['player'+n][k] = null // set column to null if it dies from the attack
          }
        }
        thisCard.age += 1 // age by 1
      }
    }
    UI_Handler.displayBoard(boardInfo);
  });
});

// SEPARATOR - You are now entering Not Socket

//neccessary Util functions
export function $(el) { return document.getElementById(el) };
export function getOffset( el ) {
    var _x = 0;
    var _y = 0;
    while( el && !isNaN( el.offsetLeft ) && !isNaN( el.offsetTop ) ) {
        _x += el.offsetLeft - el.scrollLeft;
        _y += el.offsetTop - el.scrollTop;
        el = el.offsetParent;
    }
    return { top: _y, left: _x };
}
export function clearElement(el){
    while(el.firstChild){
        el.removeChild(el.firstChild);
    }
}
export function getUIHandler(){
    return UI_Handle;
}
export function getCardLib(){
    return CardLibrary;
}
export function cloneObject(obj){
    return JSON.parse(JSON.stringify(obj));
}