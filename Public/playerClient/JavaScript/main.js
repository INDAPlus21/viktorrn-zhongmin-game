import * as Card from './cards.js';
import * as UIHandler from './uiHandler.js';
import * as DataManagerImport from '../../dataManager/dataManager.js';
//import e from './express'; // Comment- doesnt load

let currentlyYourTurn = false;
let UI_Handler = new UIHandler.UIHandler($('handPoint'),$('actionSlots'),$('cardSelectionPage'),$('cardPickZone')); 
let DataManager = new DataManagerImport.DataManager();
let endTurnBtn = $('endTurnBtn');

let playerHand;
let playerBoard = new Array();

let socket = io(); // event listener/emitter
let roomId; // room id
let playerName;
let socketId;

socket.on('connect', () => {// run this when connected
    socketId = socket.id; // save this
    console.log("I'm online! with id " + socketId);
});

$('joinServerBtn').onmousedown = () =>{
    roomId = ($('serverIP').value).toLowerCase();
    playerName = $('loginPlayerName').value;

    socket.emit('joinRoom', roomId, playerName, socketId, (verdict, reason) => {
        if (verdict==='fail') $('loginErrorText').innerHTML = reason;
        else {
            $('login').classList.remove('onscreen');
            $('selectStarterCards').classList.add('onscreen');
        }
    });
}

socket.on('startGame', () => {
    //UI_Handler.hideCardSelectionPage();
    $('selectStarterCards').classList.remove('onscreen');
    $('playArea').classList.add('onscreen');
    UI_Handler.displayActionSlots('waitingForTurn');
})

socket.on('syncHand', (hand) => {
    playerHand = [];
    for(let i in hand){
        playerHand.push(DataManager.getSpecificCard(hand[i]))
    }
    //UI_Handler.drawHand(playerHand);
});

socket.on('startTurn', (pb , turn) => {
    console.log("start Turn")
    playerBoard = pb;
    if(turn != 0){
        UI_Handler.displayActionSlots('chooseCard');
    }   
    UI_Handler.displayActionSlots('playCards');
    UI_Handler.drawHand(playerHand);
})

window.onload = function(){
    DataManager.parseCardDataFromJSON(DataManager.jsonPath+'cards.json',DataManager,(Manager = DataManager) => {
        let cards = []
        for(let i of DataManager.startingCards) cards.push(DataManager.getSpecificCard(i));
        UI_Handler.displayCardSelectionPage(cards,"startingPhase");
        UI_Handler.displayActionSlots('chooseCard',cards);
    })
}


// this function is run when the player is done selecting their starting deck and is ready to play
export function doneWithStartingCards(cards){
    socket.emit('ready', roomId, socketId, cards);
    // @viktor at here, maybe change to another section that is just a blank waiting screen
}

export function chooseCard(cardType,deck){
    switch(cardType){
        case 'beast':

            break;
        case 'squirrel':

            break;
    }
}

export function cardPlayed(cardName,col){
    for(let c in playerHand){
        if(playerHand[c].name == cardName){
            playerHand.splice(c,1);
        }
    }
    console.log("col",col);
    socket.emit('playerPlayCard', roomId, socketId, cardName, col);
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
    return UI_Handler;
}
export function getDataManager(){
    return DataManager;
}
export function getPlayerBoard(){
    return playerBoard;
}

export function cloneObject(obj){
    return JSON.parse(JSON.stringify(obj));
}