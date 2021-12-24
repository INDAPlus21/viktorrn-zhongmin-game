import * as UIHandler from './uiHandler.js';
import * as DataManagerImport from '../../dataManager/dataManager.js';
import * as AnimationHandler from './animations.js';

let socket = io(); // event listener/emitter
let socketId; // the client's unique id for the socket connection
let roomId; // room id
let playerInfo = new Object();

let columnAmount = 4;
let playerMaxHealth = 15;

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
  p1damage: playerMaxHealth,
  p2damage: playerMaxHealth
}

let UI_Handler = new UIHandler.UIHandler($('cardSelectionPage'),$('cardPickZone'));
let DataManager = new DataManagerImport.DataManager();


window.onload = async function(){
  DataManager.parseCardDataFromJSON(DataManager.jsonPath+'cards.json',DataManager,()=>{
   /*let dummyBoard = {
      player1: [
        DataManager.getSpecificCard("Drunk"),
        null,
        null,
        null
      ],
      player2: [
        DataManager.getSpecificCard("Drunk"),
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
      
      AnimationHandler.displayAttack(getCardFromBoard(2,0),getCardFromBoard(1,0),12,2);
  }*/
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

// background music
let bgmTrapper = new Audio('./../../assets/Music/trapper.ogg');
let bgmCabin = new Audio('./../../assets/Music/cabin.ogg');
bgmTrapper.loop = true;
bgmCabin.loop = true;

function playBgm (songName) {
  switch (songName) {
    case 'trapper': bgmTrapper.play(); console.log('playing trapper theme'); break;
    case 'cabin': bgmCabin.play(); console.log('playing cabin theme'); break;
  }
}
function pauseBgm (songName) {
  switch (songName) {
    case 'trapper': bgmTrapper.pause(); break;
    case 'cabin': bgmCabin.pause(); break;
  }
}

window.onload = function () {
  $('pleaseClickOnThisForAudio').addEventListener('mousedown', function () {
    $('pleaseClickOnThisForAudio').remove();
    playBgm('trapper');
  })
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

      let playerObj = {name:playerName, id:playerId, originalDeck:[], remainingDeck:[], hand:[], statusEffects:[], blood:0}

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
        playerInfo.player1.remainingDeck = shuffle(cloneObject(playerInfo.player1.originalDeck));
        playerInfo.player2.remainingDeck = shuffle(cloneObject(playerInfo.player2.originalDeck));
        playerInfo.player2.blood = 1;
        // start this mf
        // both players draw 4 cards to put in their hand
        for (let i in [1,2,3]) {
          drawOneCard(playerInfo.player1);
          drawOneCard(playerInfo.player2);
        }
        playerInfo.player1.hand.push(DataManager.getSpecificCard('Human'));
        playerInfo.player2.hand.push(DataManager.getSpecificCard('Human'));
        //starts with giving player 1 the cards and then prompting
        UI_Handler.displayBoard(boardInfo,columnAmount,playerInfo);
        await socket.emit('startGame', roomId, playerInfo.player1.id, playerInfo.player2.id);
        await socket.emit('syncClient', playerInfo.player1, boardInfo.player1,true);
        await socket.emit('syncClient', playerInfo.player2, boardInfo.player2,true);
        await socket.emit('startTurn', playerInfo.player1.id, 0);
        GAMESTATE = 'ingame';
        $('bodyPregame').classList.remove('onscreen');
        $('bodyIngame').classList.add('onscreen');
        // bgm change
        pauseBgm('trapper');
        playBgm('cabin');
      }
    }catch (error) {
      console.log(error);
      console.log(playerInfo);
    }
  });

  socket.on('playerDrawCard', (playerId, drawnCard) => {
    let i = isPlayer(playerId);
    console.log("player Drew card",drawnCard)
    if(drawnCard == 'Human'){ 
      playerInfo['player'+i].hand.push(DataManager.getSpecificCard('Human'));}
    else{
      let card = playerInfo['player'+i].remainingDeck.shift();
      playerInfo['player'+i].hand.push(card); 
    }
   

    socket.emit('syncClient', playerInfo['player'+i], boardInfo['player'+i], true  /* this boolean makes the player client redraw their hand as well as blood */); // refresh the client with new data
    
  });

  socket.on('playerPlayCard', async (playerId, cardIndex, column) => {
    
    let i = isPlayer(playerId); // get which player it is
    let card = playerInfo['player'+i].hand[cardIndex]; // get the card that is being played
    let n = i===1 ? 2 : 1;
    playerInfo['player'+i].blood -=  playerInfo['player'+i].hand[cardIndex].cost; //charge the cards cost
    
    card.age = 0;
    //check your cards
    card = await runOnPlayedAmulets(card,boardInfo['player'+i],boardInfo['player'+n],column,false)

    // check if player has effects
    for(let e of playerInfo['player'+i].statusEffects){
      console.log("check if player has valiant hearts")
      switch(e){
        case 'Valiant Hearts':
          if(card.faction == "Humanity"){
            if(card.shieldBroken == undefined){
              card.shieldBroken = false;
            }
          }
          break;
      }
    }
    

    //trigger status cards
    for(let a of card.amulets){
      switch(a){
        case 'Valiant Hearts':
            playerInfo['player'+i].statusEffects.push('Valiant Hearts');
          break;
      }
    }    
    
    playerInfo['player'+i].hand.splice(cardIndex, 1); // remove the card from the player's hand

    boardInfo['player'+i][column] = card; // add that card to the board
    //delete boardInfo['player'+i][column].cost; // cost is irrelevant to boardInfo since it's already placed out

    socket.emit('syncClient', playerInfo['player'+i], boardInfo['player'+i],true  /* this boolean makes the player client redraw their hand as well as blood */); // refresh the client with new data
    console.log("player",playerInfo['player'+i])
    UI_Handler.displayBoard(boardInfo,columnAmount,playerInfo);
  });

  async function runOnPlayedAmulets(card,playerBoard,opposingBoard,column,wasMirrorAmulet){
    for(let a of card.amulets){
      switch(a){
        case"Shield":
          if(card.shieldBroken == undefined){
            card.shieldBroken = false;
          }
          break;
        case 'Mirror':
          if(opposingBoard[column] != null){
            card.health = opposingBoard[column].health;
            card.damage = opposingBoard[column].damage;
            card.amulets = opposingBoard[column].amulets;
            if(wasMirrorAmulet === false) runOnPlayedAmulets(card,playerBoard,opposingBoard,column,true);
          }else{
            card.health = 2;
            card.damage = 2;
            card.amulets = [];
          }
          break;
        case 'Marching':
          card.moveDirection = 1;
          break;
        case 'Rush':
          card.age = 1;  
          break;
        case "Valiant Hearts":
          card.shieldBroken = true;
          for(let c in playerBoard){
            if(playerBoard[c] != null && c != column && playerBoard[c].faction == "Humanity" && playerBoard[c].name)
              if(playerBoard[c].shieldBroken == undefined){
                playerBoard[c].shieldBroken = false;
              }
          }
          break;
      }
    }
    return card;
  }

  socket.on('playerSacrificeCard', async (playerId,column) =>{
    try{
      //console.log("player sacrificed card on col",column)
      let i = isPlayer(playerId);
      //sigil check
      let card = boardInfo['player'+i][column];
      let removeCard =  true;
      card.lastSacrificedOnTurn = boardInfo.turn;
      for(let a of card.amulets){
        switch(a){
          case "Rebirth":
            card.health -=1;
            if(card.health > 0)
              removeCard = false;
            break;
        }
      }

      if(removeCard){
        await cardRemoved(playerInfo['player'+i],boardInfo['player'+i],column);
        boardInfo['player'+i][column] = null;
      }
      
      if(playerInfo['player'+i].blood < 4) playerInfo['player'+i].blood += 1;
      
      socket.emit('syncClient', playerInfo['player'+i], boardInfo['player'+i],true  /* this boolean makes the player client redraw their hand as well as blood */);
      
      UI_Handler.displayBoard(boardInfo,columnAmount,playerInfo);

    }catch(error){
      console.log("error",error)
    }
  });

  // big calculations in here!!!!
  socket.on('playerEndTurn', async (playerId) => {
    let atkingPlayer = isPlayer(playerId); // get which player it is
    let atkedPlayer = atkingPlayer===1 ? 2 : 1; // get the number of the opposite player

    for (let col=0; col<columnAmount; col++) { // loop through all 4 columns

      let thisCard = boardInfo['player'+atkingPlayer][col]; // the card at this position
      if (thisCard === null) continue;
        //console.log('null column');
         // if there is no card here, continue to the next column
      if(thisCard.lastTurnMoved === boardInfo.turn) continue;
      else { // if there IS a card here
        
        if (thisCard.age > 0) { // and it can attack
          
          let opposingCard = boardInfo['player'+atkedPlayer][col]; // get the opposing card
          let attackHitCard = false;
          let opponentCanBlockAir = false;

          if (opposingCard !== null){
            attackHitCard = true;
            
            for(let a of opposingCard.amulets){
              switch(a){        
                case 'Flying':
                  attackHitCard = false;
                  opponentCanBlockAir = true;
                  break;
                case 'High Block':
                  opponentCanBlockAir = true;
                  break;
              }
            }  

          }

          let damage = thisCard.damage;
          //checks for this card
          for(let a of thisCard.amulets){
            switch(a){
              case "Drunk":
                damage = 1+Math.floor(Math.random()*3);
                break;
              case 'Flying':
                attackHitCard = false;
              case 'Reach':
                if(opponentCanBlockAir) attackHitCard = true;
                break;
            }
          }          

          if (attackHitCard && damage > 0) {
    
            if(opposingCard.shieldBroken != undefined && opposingCard.shieldBroken == false){
              opposingCard.shieldBroken = true;
              damage = 0;
            }

            opposingCard.health -= damage;
            await AnimationHandler.displayAttack(getCardFromBoard(atkingPlayer,col),getCardFromBoard(atkedPlayer,col),opposingCard,damage,atkingPlayer,true);
            await new Promise(r => setTimeout(r, 500));

            if (opposingCard.health <= 0){
              await cardRemoved(playerInfo['player'+atkedPlayer],boardInfo['player'+atkedPlayer],col);
              boardInfo['player'+atkedPlayer][col] = null;
            }  // set column to null if it dies from the attack
        
          } else if(damage > 0) {
            
            await AnimationHandler.displayAttack(getCardFromBoard(atkingPlayer,col),$('p'+atkedPlayer+"SlotIndex"+col),null,damage,atkingPlayer,false);
            boardInfo[`p${atkedPlayer}damage`] -= damage; // if there is no card opposing it OR if this card ignores opposing cards, attack the player
            //console.log(`card: ${thisCard.name} from player ${i} dealt ${thisCard.damage}, total ${boardInfo[`p${i}damage`]}`);
            
            }
          }
        
        //post attack amulet
        if(thisCard.age > 0){
          for(let a of thisCard.amulets){
            switch(a){
              case 'Marching':
                thisCard.lastTurnMoved = boardInfo.turn;
                console.log(boardInfo['player'+atkingPlayer][col + thisCard.moveDirection])
                  if(boardInfo['player'+atkingPlayer][col + thisCard.moveDirection] !== null ){
                    thisCard.moveDirection = -thisCard.moveDirection;
                  }
                  if(boardInfo['player'+atkingPlayer][col + thisCard.moveDirection] === null ){
                    boardInfo['player'+atkingPlayer][col + thisCard.moveDirection] = thisCard;
                    boardInfo['player'+atkingPlayer][col] = null;
                  }
  
                break;
            }
          }
        }
        thisCard.age += 1 
        socket.emit('syncClient', playerInfo['player'+atkingPlayer], boardInfo['player'+atkingPlayer], true /* this boolean makes the player client redraw their hand as well as blood */  ); 
      }
    }
    
    UI_Handler.displayBoard(boardInfo,columnAmount,playerInfo);

    await new Promise(r => setTimeout(r, 1000)); // wait 1 sec

    if (boardInfo.p2damage <= 0) {
      socket.emit('endGame', playerInfo.player1.id, playerInfo.player2.id);
    } else if (boardInfo.p1damage <= 0) {
      socket.emit('endGame', playerInfo.player2.id, playerInfo.player1.id);
    } else { // no win condition was reached
      if (atkingPlayer===2) boardInfo.turn += 1 // if the player is player2 then a round has passed
      // the opposing player's turn starts
      socket.emit('syncClient', playerInfo['player'+atkedPlayer], boardInfo['player'+atkedPlayer],true);
      socket.emit('startTurn', playerInfo['player'+atkedPlayer].id, boardInfo.turn);
    }
  });
});

// SEPARATOR - You are now entering Not Socket

async function cardRemoved(playerObj,playerBoard,column){
  let card = playerBoard[column];
  for(let a of card.amulets){
    switch(a){
      case 'Valiant Hearts':
        console.log("found valiant heart")
        let other = false;
        for(let c in playerBoard){
          if(playerBoard[c] == null || c == column)continue;
          for(let a of playerBoard[c].amulets){
            if(a == 'Valiant Hearts') other = true;
          }
        }
        if(other) return;
        console.log("Removing it")
        for(let e in playerObj.statusEffects){
          console.log("removed valiant heart")
          if(playerObj.statusEffects[e] = 'Valiant Hearts') playerObj.statusEffects.splice(e,1);
        }
        break;
    }
  }
}

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