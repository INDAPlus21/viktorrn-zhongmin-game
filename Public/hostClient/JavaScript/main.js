import * as UIHandler from './uiHandler.js';
import * as DataManagerImport from '../../dataManager/dataManager.js';

let socket = io(); // event listener/emitter
let socketId; // the client's unique id for the socket connection
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

class GameObject{
    players = []
    playerTurn = null; // can be either 0 or 1 depending on player based on index in players  
    currentPhase;

    createPlayer(){
        if(this.players.length >= 1) return false;
        let player = new PlayerObject();
        this.players.push(player);
        return true;
    }
}

let UI_Handler = new UIHandler.UIHandler($('cardSelectionPage'),$('cardPickZone'));
let DataManager = new DataManagerImport.DataManager();
let boolToggle = false;
let cards = [1,2,3,4,5,6]

window.onload = function(){
}

// socket connection
socket.on('connect', () => {// run this when connected
  console.log("I'm online! with id " + socket.id);
  socketId = socket.id;

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