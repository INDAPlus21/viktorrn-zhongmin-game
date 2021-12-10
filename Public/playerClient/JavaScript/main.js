import * as Card from './cards.js';
import * as UIHandler from './uiHandler.js';
import * as DataManagerImport from '../../dataManager/dataManager.js';
//import e from './express'; // Comment- doesnt load

let currentlyYourTurn = false;
let UI_Handler = new UIHandler.UIHandler($('handPoint'),$('actionSlots'),$('cardSelectionPage'),$('cardPickZone')); 
let DataManager = new DataManagerImport.DataManager();
let endTurnBtn = $('endTurnBtn');

let playerHand;
let playerBoard;
let yourTurn = false;

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

socket.on('startGame', (playerId,board) => {
    //UI_Handler.hideCardSelectionPage();
    console.log("startGame")
    $('selectStarterCards').classList.remove('onscreen');
    $('playArea').classList.add('onscreen');
    if (playerId === socketId) {
        UI_Handler.displayActionSlots();
        UI_Handler.drawHand();
    }else{
        UI_Handler.displayActionSlots('waitIngForTurn');
    }
})

socket.on('syncHand', (hand,board) => {
    playerHand = [];
    for(let i in hand){
        playerHand.push().DataManager.getSpecificCard(hand[i]);
    }
    UI_Handler.drawHand(playerHand);
});

socket.on('startTurn', (playerId,playerBoard) => {
    if (playerId === socketId) {
        
    }
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

export function cardPlayed(cardName){

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

export function getYourTurn(){
    return yourTurn;
}

export function cloneObject(obj){
    return JSON.parse(JSON.stringify(obj));
}