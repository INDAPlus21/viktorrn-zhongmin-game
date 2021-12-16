import * as Card from '../../dataManager/cards.js';
import * as UIHandler from './uiHandler.js';
import * as DataManagerImport from '../../dataManager/dataManager.js';
//import e from './express'; // Comment- doesnt load

let currentlyYourTurn = false;
let UI_Handler = new UIHandler.UIHandler($('handPoint'),$('actionSlots'),$('cardSelectionPage'),$('cardPickZone'),$('selectedCards'),$('bloodLevel')); 
let DataManager = new DataManagerImport.DataManager();
let endTurnBtn = $('endTurnBtn');

let playerData = {hand:null,board : new Array(),bloodLevel:null,deck:null}

let socket = io(); // event listener/emitter
let roomId; // room id
let playerName;
let socketId;

window.onload = function(){
    DataManager.parseCardDataFromJSON(DataManager.jsonPath+'cards.json',DataManager,(Manager = DataManager) => {
        let cards = []
        for(let i of DataManager.startingCards) cards.push(DataManager.getSpecificCard(i));
        UI_Handler.displayCardSelectionPage(cards);
        //UI_Handler.displayActionSlots('chooseCard',cards);
        //UI_Handler.drawHand(cards);
        $('handPoint').classList.add('displaying');
        $('endTurnBtn').onpointerdown = endTurn;
        $('sacrificeCardBtn').onpointerdown = ()=> {UI_Handler.suggestSacrifices(getPlayerData().board);}
    })
}

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

socket.on('syncClient', (hand,playerboard,bloodLevel,playerDeck) => {
    console.log("sync",hand,playerboard,bloodLevel)
    playerData.hand = hand;
    playerData.board = playerboard;
    playerData.bloodLevel = bloodLevel;
    playerData.deck = playerDeck;
    UI_Handler.drawBloodLevel(playerData.bloodLevel);
});

socket.on('startTurn', (turn) => {
    console.log("playerData",playerData,"start");
    currentlyYourTurn = true;
    if(turn !== 0){
        UI_Handler.displayActionSlots('chooseCard');
    }   
    UI_Handler.displayActionSlots('playCards',[],playerData.board);
    UI_Handler.drawHand(playerData.hand);
    $('endTurnBtn').classList.add('displaying');
    $('handPoint').classList.add('displaying');
    $('sacrificeCardBtn').classList.add('displaying');
});

socket.on('youWin', () => {
    $('playArea').classList.remove('onscreen');
    $('youWin').classList.add('onscreen');
});

socket.on('youLose', () => {
    $('playArea').classList.remove('onscreen');
    $('youLose').classList.add('onscreen');
});

export function endTurn() {
    $('endTurnBtn').classList.remove('displaying');
    $('sacrificeCardBtn').classList.remove('displaying');
    currentlyYourTurn = false;
    UI_Handler.displayActionSlots('waitingForTurn');
    socket.emit('playerEndTurn', roomId, socketId);
}

export function sacrificeCard(column){
    socket.emit('playerSacrificeCard', roomId, socketId, column);
}


// this function is run when the player is done selecting their starting deck and is ready to play
export function doneWithStartingCards(cards){
    UI_Handler.hideCardSelectionPage();
    let deck = [];
    for(let i in cards){
        deck.push(DataManager.getSpecificCard(cards[i]))
    }
    socket.emit('ready', roomId, socketId, deck);
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

export function cardPlayed(cardIndex,col){
    playerData.hand.splice(cardIndex,1);
    UI_Handler.drawHand(playerData.hand);
    socket.emit('playerPlayCard', roomId, socketId, cardIndex, col);
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
export function getPlayerData(){
    return playerData;
}
export function getPlayerTurn(){
    return currentlyYourTurn;
}
export function cloneObject(obj){
    return JSON.parse(JSON.stringify(obj));
}