import * as UIHandler from './uiHandler.js';
import * as DataManagerImport from '../../dataManager/dataManager.js';
import * as AnimationHandler from './animations.js';

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


window.onload = async function(){
  DataManager.parseCardDataFromJSON(DataManager.jsonPath+'cards.json',DataManager,()=>{
    let dummyBoard = {
      player1: [
        DataManager.getSpecificCard("Wolf"),
        null,
        null,
        null
      ],
      player2: [
        DataManager.getSpecificCard("Wolf"),
        null,
        null,
        null
      ],
      turn: 0,
      p1damage: 0,
      p2damage: 0
    }

    console.log("dummyBoard",dummyBoard);
    UI_Handler.displayBoard(dummyBoard)

    $('spawnEffect').onpointerdown = () =>{
      
      AnimationHandler.displayAttack(getCardFromBoard(1,0),getCardFromBoard(2,0),12);
  }
  });
  
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

  socket.on('playerReady', async (playerId, deck) => {
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
        playerInfo.player2.blood = 1;
        // start this mf
        // both players draw 4 cards to put in their hand
        for (let i in [1,2,3]) {
          drawOneCard(playerInfo.player1);
          drawOneCard(playerInfo.player2);
        }
        playerInfo.player1.hand.push(DataManager.getSpecificCard('Squirrel'));
        playerInfo.player2.hand.push(DataManager.getSpecificCard('Squirrel'));
        //starts with giving player 1 the cards and then prompting
        UI_Handler.displayBoard(boardInfo);
        await socket.emit('startGame', roomId, playerInfo.player1.id, playerInfo.player2.id);
        await socket.emit('syncClient', playerInfo.player1, boardInfo.player1);
        await socket.emit('syncClient', playerInfo.player2, boardInfo.player2);
        await socket.emit('startTurn', playerInfo.player1.id, 0);
        GAMESTATE = 'ingame';
        $('bodyPregame').classList.remove('onscreen');
        $('bodyIngame').classList.add('onscreen');
      }
    }catch (error) {
      console.log(error);
      console.log(playerInfo);
    }
  });

  socket.on('playerDrawCard', (playerId, drawnCard) => {
    let i = isPlayer(playerId);
    console.log("player Drew card",drawnCard)
    if(drawnCard == 'Squirrel'){ 
      playerInfo['player'+i].hand.push(DataManager.getSpecificCard('Squirrel'));}
    else{
      let card = playerInfo['player'+i].remainingDeck.shift();
      playerInfo['player'+i].hand.push(card); 
    }
   

    socket.emit('syncClient', playerInfo['player'+i], boardInfo['player'+i], true  /* this boolean makes the player client redraw their hand as well as blood */); // refresh the client with new data
    
  });

  socket.on('playerPlayCard', (playerId, cardIndex, column) => {
    
    let i = isPlayer(playerId); // get which player it is
    let card = playerInfo['player'+i].hand[cardIndex]; // get the card that is being played
    playerInfo['player'+i].blood -=  playerInfo['player'+i].hand[cardIndex].cost; //charge the cards cost
    
    switch(card.name){
      case 'Warren':
          drawSpecificCard(playerInfo['player'+i],"Rabbit");
        break;
    }
    
    playerInfo['player'+i].hand.splice(cardIndex, 1); // remove the card from the player's hand
    

    boardInfo['player'+i][column] = card; // add that card to the board
    //delete boardInfo['player'+i][column].cost; // cost is irrelevant to boardInfo since it's already placed out
    boardInfo['player'+i][column].age = 0; // how long the card has been on the board

    //sigil check
    

    socket.emit('syncClient', playerInfo['player'+i], boardInfo['player'+i],true  /* this boolean makes the player client redraw their hand as well as blood */); // refresh the client with new data

    UI_Handler.displayBoard(boardInfo);
  });

  socket.on('playerSacrificeCard',(playerId,column) =>{
    try{
      console.log("player sacrificed card on col",column)
      let i = isPlayer(playerId);
      //sigil check
      let card = boardInfo['player'+i][column];
      let removeCard =  true;
      switch(card.sigil){
        case "Many Lives":
          removeCard = false;
          break;
      }

      if(removeCard)
      boardInfo['player'+i][column] = null;
      
      if(playerInfo['player'+i].blood < 4) playerInfo['player'+i].blood += 1;
      
      socket.emit('syncClient', playerInfo['player'+i], boardInfo['player'+i],true  /* this boolean makes the player client redraw their hand as well as blood */);
      
      UI_Handler.displayBoard(boardInfo);

    }catch(error){
      console.log("error",error)
    }
  });

  // big calculations in here!!!!
  socket.on('playerEndTurn', async (playerId) => {
    let i = isPlayer(playerId); // get which player it is
    let n = i===1 ? 2 : 1; // get the number of the opposite player

    for (let k=0; k<4; k++) { // loop through all 4 columns

      let thisCard = boardInfo['player'+i][k]; // the card at this position
      if (thisCard === null) continue;
        //console.log('null column');
         // if there is no card here, continue to the next column

      else { // if there IS a card here
        console.log('card: '+thisCard); 
        if (thisCard.age > 0) { // and it can attack
          
          let opposingCard = boardInfo['player'+n][k]; // get the opposing card

          let attackHitCard = false;
          
          if (opposingCard !== null){
            // run sigil checks relevent to attacking
            
            attackHitCard = true; // asume the card hits and ajust afterwards

            switch(thisCard.sigil){
              case 'Flying':
                if(opposingCard.sigil != 'Flying')
                  attackHitCard = false;
                break;
            }
          } 

          if (attackHitCard) {
            
            opposingCard.health -= thisCard.damage; // attack the opposing card
            if(opposingCard.sigil == 'Sharp Quills') thisCard.health -= 1; //Porcupine
            if (opposingCard.health <= 0) boardInfo['player'+n][k] = null // set column to null if it dies from the attack
            if (thisCard.health <= 0) boardInfo['player'+i][k] = null
          } else {
            
            boardInfo[`p${i}damage`] += thisCard.damage; // if there is no card opposing it OR if this card ignores opposing cards, attack the player
            console.log(`card: ${thisCard.name} from player ${i} dealt ${thisCard.damage}, total ${boardInfo[`p${i}damage`]}`);
            
          }
       }
        thisCard.age += 1 
        // run sigil check relevent to age
        if(thisCard.age > 1 && thisCard.sigil === "Fledgling"){
          switch(thisCard.name){
            case 'Wolf Cub':
               boardInfo['player'+i][k] = await DataManager.getSpecificCard("Wolf");
            break;
            case 'Raven Egg':
              boardInfo['player'+i][k] = await DataManager.getSpecificCard("Raven");
            break;
          }
          boardInfo['player'+i][k].age = 1;
        }
        socket.emit('syncClient', playerInfo['player'+i], boardInfo['player'+i], true /* this boolean makes the player client redraw their hand as well as blood */  ); 
      }
    }
    
    UI_Handler.displayBoard(boardInfo);

    await new Promise(r => setTimeout(r, 1000)); // wait 1 sec

    console.log("starting player "+n+"'s turn");

    // testing for win condition (must tip the scale by 7 to win)
    if (boardInfo.p1damage -6 > boardInfo.p2damage) {
      socket.emit('endGame', playerInfo.player1.id, playerInfo.player2.id);
    } else if (boardInfo.p2damage -6 > boardInfo.p1damage) {
      socket.emit('endGame', playerInfo.player2.id, playerInfo.player1.id);
    } else { // no win condition was reached
      if (i===2) boardInfo.turn += 1 // if the player is player2 then a round has passed
      // the opposing player's turn starts
      socket.emit('syncClient', playerInfo['player'+n], boardInfo['player'+n],true);
      socket.emit('startTurn', playerInfo['player'+n].id, boardInfo.turn);
    }
  });
});

// SEPARATOR - You are now entering Not Socket

function drawSpecificCard(playerObj, cardName){
  playerObj.hand.push(DataManager.getSpecificCard(cardName));
  let i = isPlayer(playerObj.id);
  socket.emit('syncClient', playerInfo['player'+i], boardInfo['player'+i],true);
}

function drawOneCard(playerObj) {
  if (playerObj.remainingDeck.length > 0)
  playerObj.hand.push(playerObj.remainingDeck.shift());
  // shift() takes one element from the array and pushes it into the player's hand
}


function getCardFromBoard(playerIndex,col){
  return $(`p${playerIndex}Card_${col}`);
}


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