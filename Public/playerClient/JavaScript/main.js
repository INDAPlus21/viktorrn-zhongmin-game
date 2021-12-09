import * as Card from './cards.js';
import * as UIHandler from './uiHandler.js';
import * as DataManagerImport from '../../dataManager/dataManager.js';

let currentlyYourTurn = false;
let UI_Handler = new UIHandler.UIHandler($('handPoint'),$('cardPlacementSlots'),$('cardSelectionPage'),$('cardPickZone')); 
let DataManager = new DataManagerImport.DataManager();
let endTurnBtn = $('endTurnBtn');

let socket = io(); // event listener/emitter
let roomId; // room id
let playerName;
let socketId;

socket.on('connect', () => {// run this when connected
    socketId = socket.id; // save this
    console.log("I'm online! with id " + socketId);
});

$('joinServerBtn').onmousedown = () =>{
    roomId = $('serverIP').value;
    playerName = $('loginPlayerName').value;

    socket.emit('joinRoom', roomId, playerName, socketId, (verdict, reason) => {
        if (verdict==='fail') $('loginErrorText').innerHTML = reason;
        else {
            $('login').classList.remove('onscreen');
            $('selectstartercards').classList.add('onscreen');
        }
    });
}

window.onload = function(){
    DataManager.parseCardDataFromJSON(DataManager.jsonPath+'cards.json',DataManager,(Manager = DataManager) => {
        let cards = []
        for(let i of DataManager.startingCards) cards.push(DataManager.getSpecificCard(i));
        UI_Handler.displayCardSelectionPage(cards,"startingPhase");
        UI_Handler.drawDropZones();
        yourTurn(cards);
    })
}

function yourTurn(cardsInHand,cardsPlayed){ //will be changed to a socket on function
    currentlyYourTurn = true;
    UI_Handler.drawHand(cardsInHand);
    UI_Handler.cardsPlayed = cardsPlayed;
   
}

export function doneWithStartingCards(cards){
    UI_Handler.hideCardSelectionPage();
    console.log(cards);
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
export function cloneObject(obj){
    return JSON.parse(JSON.stringify(obj));
}