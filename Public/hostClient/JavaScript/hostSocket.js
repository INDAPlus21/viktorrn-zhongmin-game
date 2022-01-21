import * as UIHandler from './uiHandler.js';
import * as DataManagerImport from '../../dataManager/dataManager.js';
import * as AnimationHandler from '../../dataManager/animations.js';
import * as VixiAI from './vixiAI.js';
import { textAmulets } from '../../dataManager/cards.js';

let socket = io(); // event listener/emitter
let socketId; // the client's unique id for the socket connection
let roomId; // room id
let playerInfo = new Object();

let columnAmount = 4;
let playerMaxHealth = 12;
let amountOfHumanCards = 15;

let lobbyData = {
  currentRound: 0,
  p1Ready: false,
  p2Ready: false,
  p1Wins: 0,
  p2Wins: 0,
  GAMESTATE: 'lobby',
  currentMode: 0  //0 is pvp, 1 is pve
}


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

// background music
let bgmTrapper = new Audio('./../../assets/Music/trapper.ogg');
let bgmCabin = new Audio('./../../assets/Music/cabin.ogg');
bgmTrapper.loop = true;
bgmCabin.loop = true;
// sfx
let sfxAttack = new Audio('./../../assets/Music/sfx_attack.ogg');
let sfxPlaceCard = new Audio('./../../assets/Music/sfx_placecard.ogg');

async function playBgm (songName) {
  switch (songName) {
    case 'trapper': bgmTrapper.play();break;
    case 'cabin': bgmCabin.play();break;
  }
}
async function pauseBgm (songName) {
  switch (songName) {
    case 'trapper': bgmTrapper.pause(); break;
    case 'cabin': bgmCabin.pause(); break;
  }
}
async function playSfx (sfx) {
  switch (sfx) {
    case 'attack': sfxAttack.play();break;
    case 'playcard': sfxPlaceCard.play();break;
  }
}

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
  $('displayCardComparisionPage').onpointerdown = () =>{
    if($('bodyPregame').classList[0] == 'onscreen'){
      $('bodyPregame').classList.remove('onscreen');
      $('cardComparison').classList.add('onscreen');
    }else{
      $('bodyPregame').classList.add('onscreen');
      $('cardComparison').classList.remove('onscreen');
    }
  }
  let hand = ["Frank","Human","Blood Beast","Bat","Sparrow","Bow Man","Cannon"];
  let cardsToCompareAgainst = ["Frank","Human","Blood Beast","Bat","Sparrow","Bow Man","Cannon"];
  runCardComparisons(cardsToCompareAgainst,hand);

  $('pleaseClickOnThisForAudio').addEventListener('mousedown', function () {
    $('pleaseClickOnThisForAudio').remove();
    playBgm('cabin');
  })
  }); 
}

function toggleLobbyMode(dir){
  lobbyData.currentMode = Math.abs( (lobbyData.currentMode + dir) % 2 );
  switch(lobbyData.currentMode){
    case 0:
        $('currentMode').innerText = "PvP";
       
        if(playerInfo.player1.id == '000'){
          console.log(playerInfo)
          onPlayerLeave(playerInfo.player1.id);
        }
      break;
    case 1: 
        $('currentMode').innerText = "PvE";

        let cards = [ "Blood Beast" , "Frank" , "Bow Man" , "Cannon" ];
        let deck = [];
        for(let c of cards){
          deck.push(DataManager.getSpecificCard(c));
        }
        let playerObj = {name:"Botward", id:'000', originalDeck:deck, remainingDeck:[], hand:[], statusEffects:[], blood:0}
        
        playerInfo.player1 = playerObj;
        onPlayerReady(socket,'000');
      break;
  }
}

function runCardComparisons(hand,deck){
  for(let i in hand) hand[i] = DataManager.getSpecificCard(hand[i]);
  for(let i in deck) deck[i] = DataManager.getSpecificCard(deck[i]);
  for(let c of hand){
    let tr = document.createElement('tr');
    let td1 = document.createElement('td');
    td1.innerHTML = c.name + "<br>" + c.damage + "/" +c.health +":"+c.cost + "<br>" + textAmulets(c) + "<br>" + " ";
    tr.appendChild(td1);
    let opposingCards = [];
    for(let oc of deck){
      opposingCards.push({card : oc, score : VixiAI.compareCards(oc,c)})
    }
    VixiAI.sortItems(opposingCards);
    for(let c of opposingCards){
      let td2 = document.createElement('td');
      td2.innerHTML = c.card.name + "<br>" + c.card.damage + "/" +c.card.health +":"+c.card.cost + "<br>" + textAmulets(c.card) + "<br>" + c.score;
      tr.appendChild(td2);
    }
    $('scoreboard').appendChild(tr)
  }
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
    
    $('leftArrow').onpointerdown = () => {
      toggleLobbyMode(-1);
    }
  
    $('rightArrow').onpointerdown = () => {
      toggleLobbyMode(1);
    }
  });

  // playerClient's joinRoom -> server's isRoomOpen?
  socket.on('isRoomOpen?', (playerName, playerId, callback) => {
    let answer = new Array();
    answer[0] = false;

    answer[1] = (Object.keys(playerInfo).length > 1) ? "The room is full."
              : (lobbyData.GAMESTATE !== 'lobby') ? "The game has already started."
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

  socket.on('playerLeftRoom', (playerId) => {
    onPlayerLeave(playerId);
  });

  socket.on('playerReady', async (playerId) => {
    onPlayerReady(socket,playerId);
  });

  socket.on("playerSelectedCards", async (playerId, deck) => {
   onPlayerSelectedCards(playerId, deck)
  })

  socket.on('playerDrawCard', (playerId, drawnCard) => {
    onPlayerDrawCard(socket,playerId,drawnCard);
  });

  socket.on('playerPlayCard', async (playerId, cardIndex, column) => {
    onPlayerPlayCard(socket,playerId,cardIndex,column);
    playSfx('playcard')
  });

  socket.on('playerSacrificeCard', async (playerId,column) =>{
    onSacrificeCard(socket,playerId,column);
  });

  // big calculations in here!!!!
  socket.on('playerEndTurn', async (playerId) => {
    onPlayerEndTurn(socket,playerId);
  });

});

// X----------------X
// | Util functions |
// X----------------X

function isPlayer (playerId) {
  //if(playerInfo.player1 == undefined && playerInfo.player2 == undefined) return false;
  if (playerInfo.player1.id == playerId) return 1;
  else if (playerInfo.player2.id == playerId) return 2;
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

// X- - - - - - - - -X
// | input functions |
// X- - - - - - - - -X

export async function onPlayerReady(socket,playerId){
  try{
    
    if (isPlayer(playerId)===1) {
      $('player1State').innerHTML = `<span>${playerInfo.player1.name}</span><br><b>READY!</b>`
      lobbyData.p1Ready = true;
    }

    if (isPlayer(playerId)===2) {
      $('player2State').innerHTML = `<span>${playerInfo.player2.name}</span><br><b>READY!</b>`
      lobbyData.p2Ready = true;
    }

  // check if game can start // cheep as error handling, yes box
  
    if (lobbyData.p1Ready && lobbyData.p2Ready) {
      lobbyData.currentRound += 1;
      boardInfo.turn = 0;

      let starting = Math.ceil(Math.random()*2);
      let other = starting == 1 ? 2 : 1;
      
      //setting data
      playerInfo['player'+starting].hand = [];
      playerInfo['player'+other].hand = [];
      playerInfo['player'+starting].blood = 0;
      playerInfo['player'+other].blood = 1;
      playerInfo['player'+starting].statusEffects = [];
      playerInfo['player'+other].statusEffects = [];
      playerInfo['player'+starting].humanCards = amountOfHumanCards;
      playerInfo['player'+other].humanCards = amountOfHumanCards;
      
      boardInfo.p1damage = playerMaxHealth;
      boardInfo.p2damage = playerMaxHealth;
      boardInfo.player1 = [ null , null , null , null ];
      boardInfo.player2 = [ null , null , null , null ];
      
      playerInfo.player1.remainingDeck = shuffle(cloneObject(playerInfo.player1.originalDeck));
      playerInfo.player2.remainingDeck = shuffle(cloneObject(playerInfo.player2.originalDeck));

      // both players draw 4 cards to put in their hand
      for (let i in [1,2,3]) {
        drawOneCard(playerInfo.player1);
        drawOneCard(playerInfo.player2);
      }

      playerInfo.player1.hand.push(DataManager.getSpecificCard('Human'));
      playerInfo.player2.hand.push(DataManager.getSpecificCard('Human'));
      //starts with giving player 1 the cards and then prompting
      UI_Handler.displayBoard(boardInfo,columnAmount,playerInfo);

      await socket.emit('startGame', roomId, playerInfo['player'+starting].id, playerInfo['player'+other].id);
      
      await socket.emit('syncClient', playerInfo.player1, boardInfo.player1,true);
      await socket.emit('syncClient', playerInfo.player2, boardInfo.player2,true);
      
      if(playerInfo['player'+starting].id == '000') {
        VixiAI.takeTurn( cloneObject(playerInfo) , cloneObject(boardInfo) )
        onPlayerEndTurn(socket,'000')
      }
      else {
        await socket.emit('startTurn', playerInfo['player'+starting].id, 0);
      }
      
      lobbyData.GAMESTATE = 'ingame';
      
      $('bodyPregame').classList.remove('onscreen');
      $('bodyIngame').classList.add('onscreen');
      // bgm change
      pauseBgm('cabin');
      playBgm('trapper');
    }
  }catch (error) {
    console.log(error);
    console.log(playerInfo);
  }
}

export async function onPlayerLeave(socket,playerId){
  let player = 1;
  console.log("player",playerId)
  if(!player) return;
  delete playerInfo['player'+player];
  if(lobbyData.GAMESTATE === "lobby"){
    $('player'+player+'State').innerHTML = "Waiting...";
  }
}

export async function onPlayerSelectedCards(playerId, deck){
  console.log("player Selected cards",deck,playerId)
  if (isPlayer(playerId)===1) {
    for(let c of deck) playerInfo.player1.originalDeck.push(c);
  }
  if (isPlayer(playerId)===2) {
    for(let c of deck) playerInfo.player2.originalDeck.push(c);
  }
}

export async function onSacrificeCard(socket, playerId, column){
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
      await removePlayerStatusEffect(playerInfo['player'+i],boardInfo['player'+i],column);
      boardInfo['player'+i][column] = null;
    }
    
    if(playerInfo['player'+i].blood < 4) playerInfo['player'+i].blood += 1;
    
    socket.emit('syncClient', playerInfo['player'+i], boardInfo['player'+i],true  /* this boolean makes the player client redraw their hand as well as blood */);
    
    UI_Handler.displayBoard(boardInfo,columnAmount,playerInfo);

  }catch(error){
    console.log("error",error)
  }
} 

export async function onPlayerDrawCard(socket, playerId, drawnCard){
  let i = isPlayer(playerId);
    if(drawnCard == 'Human'){ 
      playerInfo['player'+i].hand.push(DataManager.getSpecificCard('Human'));}
    else{
      let card = playerInfo['player'+i].remainingDeck.shift();
      playerInfo['player'+i].hand.push(card); 
    }

    for(let e of playerInfo['player'+i].statusEffects){
      if(e === "Hound Master" && playerInfo['player'+i].hand.length < 7){playerInfo['player'+i].hand.push(DataManager.getSpecificCard('Blood Beast'));}
    }

    if(playerId != "000") socket.emit('syncClient', playerInfo['player'+i], boardInfo['player'+i], true  /* this boolean makes the player client redraw their hand as well as blood */); // refresh the client with new data
}

export async function onPlayerPlayCard(socket, playerId, cardIndex, column){
  let i = isPlayer(playerId); // get which player it is
    let card = playerInfo['player'+i].hand[cardIndex]; // get the card that is being played
    let n = i===1 ? 2 : 1;
    playerInfo['player'+i].blood -=  playerInfo['player'+i].hand[cardIndex].cost; //charge the cards cost
    
    card.age = 0;
    //check your cards
    card = await runOnPlayedAmulets(card,boardInfo['player'+i],boardInfo['player'+n],column,false)

    // check if player has effects
    for(let e of playerInfo['player'+i].statusEffects){
      switch(e){
        case 'Valiant Hearts':
          if(card.faction != "Humanity") return;
          if(card.shieldBroken != undefined)return;
          card.shieldBroken = false;
          break;
      }
    }

    //trigger status cards
    for(let a of card.amulets){
      switch(a){
        case 'Valiant Hearts':
            playerInfo['player'+i].statusEffects.push('Valiant Hearts');
          break;
        case 'Hound Master':
            playerInfo['player'+i].statusEffects.push('Hound Master');
          break;
      }
    }    
    
    playerInfo['player'+i].hand.splice(cardIndex, 1); // remove the card from the player's hand

    boardInfo['player'+i][column] = card; // add that card to the board
    //delete boardInfo['player'+i][column].cost; // cost is irrelevant to boardInfo since it's already placed out

    if(playerId != "000") socket.emit('syncClient', playerInfo['player'+i], boardInfo['player'+i],true  /* this boolean makes the player client redraw their hand as well as blood */); // refresh the client with new data
    
    UI_Handler.displayBoard(boardInfo,columnAmount,playerInfo);
}

export async function onPlayerEndTurn(socket, playerId){
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
                damage = Math.floor(Math.random()*4);
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

            for(let a of opposingCard.amulets){
              switch(a){
                case'Headed Hunter':
                  opposingCard.damage += damage;
                break;
              }
              
            }
            playSfx('attack');
            await AnimationHandler.displayAttack(getCardFromBoard(atkingPlayer,col),getCardFromBoard(atkedPlayer,col),opposingCard,damage,atkingPlayer,true);
            await new Promise(r => setTimeout(r, 500));

            if (opposingCard.health <= 0){
              await removePlayerStatusEffect(playerInfo['player'+atkedPlayer],boardInfo['player'+atkedPlayer],col);
              onCardDieEvent(playerInfo['player'+atkedPlayer],boardInfo['player'+atkedPlayer],col)
            }
        
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
                  if(boardInfo['player'+atkingPlayer][col + thisCard.moveDirection] !== null ){
                    thisCard.moveDirection = -thisCard.moveDirection;
                  }
                  if(boardInfo['player'+atkingPlayer][col + thisCard.moveDirection] === null ){
                    boardInfo['player'+atkingPlayer][col + thisCard.moveDirection] = thisCard;
                    boardInfo['player'+atkingPlayer][col] = null;
                  }
  
                break;
              case 'Growth':
                switch(thisCard.name){
                  default:
                    break;
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
      lobbyData.p1Wins += 1;
      if(lobbyData.p1Wins >= 2)
      socket.emit('endGame', playerInfo.player1.id, playerInfo.player2.id);
      else{
        endRound(socket);
      } 
      return;
    } 
    
    if (boardInfo.p1damage <= 0) {
      lobbyData.p2Wins += 1;
      if(lobbyData.p2Wins >= 2)
        socket.emit('endGame', playerInfo.player2.id, playerInfo.player1.id);
      else{
        endRound(socket);
      }
      return;
    } // no win condition was reached
      boardInfo.turn += 1
      // the opposing player's turn starts
      socket.emit('syncClient', playerInfo['player'+atkedPlayer], boardInfo['player'+atkedPlayer],true);
      socket.emit('syncClient', playerInfo['player'+atkingPlayer], boardInfo['player'+atkingPlayer],true);
      socket.emit('startTurn', playerInfo['player'+atkedPlayer].id, boardInfo.turn);
      if(playerInfo['player'+atkedPlayer].id == '000') {
        let actions = await VixiAI.takeTurn( cloneObject(playerInfo) , cloneObject(boardInfo) );
        onPlayerEndTurn(socket,playerInfo['player'+atkedPlayer].id)
      }
    
}

// game functions

async function endRound(socket){
    socket.emit('endOfRound', playerInfo.player1.id, playerInfo.player1.originalDeck, playerInfo.player2.id, playerInfo.player2.originalDeck );
    playBgm('cabin');
    pauseBgm('trapper');
    clearElement($('playerBoard'));
}

async function onCardDieEvent(playerObj,playerBoard,col){
  playerBoard[col] = null;
  for(let s in playerObj.hand){
    for(let a of playerObj.hand[s].amulets){
      if(a === "Scavenger"){
        console.log("found scavenger")
        playerBoard[col] = playerObj.hand[s];
        playerObj.hand.splice(s,1)
        return true;
      }
    }
  }
}

async function removePlayerStatusEffect(playerObj,playerBoard,column){
  let card = playerBoard[column];
  for(let a of card.amulets){
    let other = false;
    switch(a){
      case 'Valiant Hearts':
        for(let c in playerBoard){
          if(playerBoard[c] == null || c == column)continue;
          for(let a of playerBoard[c].amulets){
            if(a == 'Valiant Hearts') other = true;
          }
        }
        if(other) return;
        for(let e in playerObj.statusEffects){
          if(playerObj.statusEffects[e] = 'Valiant Hearts') playerObj.statusEffects.splice(e,1);
        }
        break;
      case 'Hound Master':
        for(let c in playerBoard){
          if(playerBoard[c] == null || c == column)continue;
          for(let a of playerBoard[c].amulets){
            if(a == 'Hound Master') other = true;
          }
        }
        if(other) return;
        for(let e in playerObj.statusEffects){
          if(playerObj.statusEffects[e] = 'Hound Master') playerObj.statusEffects.splice(e,1);
        }
        break;
    }
  }
}

async function runOnPlayedAmulets(card,playerBoard,opposingBoard,column,wasMirrorAmulet){
  for(let a of card.amulets){
    switch(a){
      case"Shield":
        if(card.shieldBroken != undefined) continue; 
        card.shieldBroken = false;      
        break;
      case 'Mirror':
        card.health = 2;
        card.damage = 2;
        card.amulets = [];
        if(opposingBoard[column] == null) continue; 
          card.health = opposingBoard[column].health;
          card.damage = opposingBoard[column].damage;
          card.amulets = opposingBoard[column].amulets;
        if(wasMirrorAmulet === true) continue; 
        runOnPlayedAmulets(card,playerBoard,opposingBoard,column,true);
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
          if(playerBoard[c] == null || c == column || playerBoard[c].faction != "Humanity") continue; 
          if(playerBoard[c].name == "Armoury") continue;
          if(playerBoard[c].shieldBroken == undefined)
            playerBoard[c].shieldBroken = false;
        }
        break;
    }
  }
  return card;
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