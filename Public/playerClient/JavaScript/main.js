import * as Card from '../../dataManager/cards.js';
import * as UIHandler from './uiHandler.js';
import * as DataManagerImport from '../../dataManager/dataManager.js';
import * as AnimationHandler from '../../dataManager/animations.js';
//import e from './express'; // Comment- doesnt load

let currentlyYourTurn = false;
let UI_Handler = new UIHandler.UIHandler($('handPoint'),$('actionSlots'),$('cardSelectionPage'),$('cardPickZone'),$('selectedCards'),$('bloodLevel')); 
let DataManager = new DataManagerImport.DataManager();

let playerData = {hand:null,board : new Array(),bloodLevel:null,deck:null}

let socket = io(); // event listener/emitter
let roomId; // room id
let playerName;
let socketId;
let displayPlayCardAreaOnSync = false;
let playerPickingCard = false;
let columnAmount = 4;
let currentTurn;

let turnForMulitpleSelects = 0;
let itemsLeftToChoose = 0;
let itemsToChoose = 2;

let cardsSlected;
let cardsLeftToSelect;

let rareCards;
let regularCards;



window.onload = function(){

    DataManager.parseCardDataFromJSON(DataManager.jsonPath+'cards.json',DataManager, (Manager = DataManager) => {

        cardsSlected = [];
        setCardPools();
        $('handPoint').classList.add('displaying');
        $('endTurnBtn').onpointerdown = endTurn;
        $('sacrificeCardBtn').onpointerdown = ()=> {UI_Handler.suggestSacrifices(getPlayerData().board);}


    })

    socket.on('connect', () => {
        socketId = socket.id; 
        //console.log("I'm online! with id " + socketId);
    });
    $('joinServerBtn').onmousedown = () =>{
        roomId = ($('serverIP').value).toLowerCase();
        playerName = $('loginPlayerName').value;
    
        socket.emit('joinRoom', roomId, playerName, socketId, (verdict, reason) => {
            if (verdict==='fail') $('loginErrorText').innerHTML = reason;
            else {
                $('chatToggle').style.display = 'block';
                $('chatToggle').onpointerdown = () =>{
                    if($('chatWrapper').style.display == 'none'){
                        $('chatWrapper').style.display = 'block';
                        $('chatToggle').style.backgroundImage = "url('../../assets/closeIcon.svg')";
                    }
                    else{
                        $('chatWrapper').style.display = 'none';
                        $('chatToggle').style.backgroundImage = "url('../../assets/chatIcon.svg')";
                    }
                }
                // the chat send thing
                $('chatSend').onpointerdown = () => {
                    if ($('chatInput').value !== '') {
                        socket.emit('chat', socketId, roomId, $('chatInput').value);
                        $('chatInput').value = '';
                    }
                }

                // the dom thing where it checks if the input key is enter - thanks stackoverflow
                $('chatInput').onkeydown = (e) => {
                    if (e.key === 'Enter' || e.keyCode === 13 && $('chatInput').value !== '') {
                        socket.emit('chat', socketId, roomId, $('chatInput').value);
                        $('chatInput').value = '';
                    }
                };
                $('theManual').style.display = 'block';
                $('login').classList.remove('onscreen');
                $('cardShop').classList.add('onscreen');
                $('playerName').innerText = playerName;
                displayCardShop(1);
                //cardsSlected = [{cardName:"Frank"},{cardName:"Frank"},{cardName:"Armoury"},{cardName:"Undead"}];
                //displayCardShop(3);
            }
        });
    }

    
    
    socket.on('startGame', () => {
        $('handPoint').classList.add('displaying');
        $('bloodLevel').classList.add('displaying');
        AnimationHandler.backgroundTextClientSide("WaitingForTurn","Wait Your Turn")
        UI_Handler.displayActionSlots('playCards',[],playerData.board,[],columnAmount);
    })
    
    socket.on('syncClient', (hand,playerboard,bloodLevel,playerDeck,redrawUI) => {
        console.log("sync",hand,playerboard,bloodLevel)
        playerData.hand = hand;
        playerData.board = playerboard;
        playerData.bloodLevel = bloodLevel;
        playerData.deck = playerDeck;
        if(redrawUI){
            UI_Handler.drawBloodLevel(playerData.bloodLevel);
            UI_Handler.drawHand(playerData.hand);
            if(displayPlayCardAreaOnSync) UI_Handler.displayActionSlots('playCards',[],playerData.board,[],columnAmount);
            displayPlayCardAreaOnSync = false; 
        }
        
    });
    
    socket.on('startTurn', (turn) => {

        console.log("playerData",playerData,"startTurn");
        UI_Handler.returnHandCard()
        currentlyYourTurn = true;
        currentTurn = turn;
        if(turn > 1){
            itemsLeftToChoose = itemsToChoose;
            UI_Handler.displayActionSlots('chooseCard',playerData.deck,[],playerData.hand);
            playerPickingCard = true;
            
            AnimationHandler.backgroundTextClientSide("DrawCard","Draw "+itemsLeftToChoose+" Card" + (itemsLeftToChoose== 1 ? "" : "s"))
        }else{
            UI_Handler.displayActionSlots('playCards',[],playerData.board,[],columnAmount);
            // if not card drawing mode right from start just go to normal playing mode directly
            AnimationHandler.backgroundTextClientSide("PlayCard","Play Your Hand")
        }  
        UI_Handler.drawHand(playerData.hand);
        $('endTurnBtn').classList.add('displaying');
        $('sacrificeCardBtn').classList.add('displaying');
        
    });

    socket.on("endOfRound",(deck)=>{
        displayCardShop(4);
    })
    
    socket.on('youWin', () => {
        $('playArea').classList.remove('onscreen');
        $('youWin').classList.add('onscreen');
    });
    
    socket.on('youLose', () => {
        $('playArea').classList.remove('onscreen');
        $('youLose').classList.add('onscreen');
    });



}

//code for card picking
function setCardPools(){
    rareCards = shuffle( DataManager.getAllStartingRareCards() );
    regularCards = shuffle (DataManager.getAllStartingRegularCards() );
}

function displayCardShop(stage){
    $('cardShop').classList.add('onscreen');
    $('playArea').classList.remove('onscreen');
    clearElement($('itemPage'))
    switch(stage){
        case 1:
            let shf0 = document.createElement('div');
            shf0.classList.add('shelf');
            cardsLeftToSelect = 1;
      

            for(let i in [1,2]){
                let c = Card.getCardDiv(rareCards.shift());
                
                c.onpointerdown = () =>{
                    let cd = {cardName:c.getAttribute('cardName'),cardDiv:c.cloneNode(true)}
                    cardsSlected.push(cd);
                    drawDeck(cardsSlected);
                    stage+=1;
                    displayCardShop(stage);
                }

                shf0.appendChild(c);
                if(i==0){
                    let text = document.createElement('div')
                    text.innerText = "or";
                    text.classList.add('shelfTextDiv');
                    shf0.appendChild(text)
                }
            }
            $('itemPage').appendChild(shf0);

            break;
        case 2:
            let shf1 = document.createElement('div');
            cardsLeftToSelect = 5; //5
            shf1.classList.add('shelf'); 
            
            let shf2 = document.createElement('div');
            shf2.classList.add('shelf');
            
            let text = document.createElement('div');
            text.classList.add('shelfHeader');
            text.id = "text";
            text.innerText = "You Need to select "+cardsLeftToSelect + " more cards"
            shf2.appendChild(text);

            for(let i in [1,2,3,4,5,6]){
                if(regularCards.length > 0){
                    let c = Card.getCardDiv(regularCards.shift());
                    c.setAttribute('timesSelected',0);
                    c.onpointerdown=()=>{
                        cardsLeftToSelect -= 1;
                        $('text').innerText = "You Need to select "+cardsLeftToSelect + " more cards";
                        console.log("cardsLeft",cardsLeftToSelect);
                        c.style.transform = "scale(1.1)";
                        
                        let timer = setInterval(()=>{
                            c.style.transform = '';
                            clearInterval(timer);
                        },300)

                        let cd = {cardName:c.getAttribute('cardName'),cardDiv:c.cloneNode(true)}
                        cardsSlected.push(cd);
                        
                        drawDeck(cardsSlected);

                        if(c.getAttribute('timesSelected') < 1){
                            c.setAttribute('timesSelected',1);

                        }else{
                            c.onpointerdown = null;
                            c.style.opacity = '0';
                        }

                       

                        if(cardsLeftToSelect <= 0){
                            stage+=1;
                            displayCardShop(stage);
                        }
                    }
                    shf1.appendChild(c);
                }

            }
            $('itemPage').appendChild(shf2);
            $('itemPage').appendChild(shf1);
            break;

        case 3:
            doneWithStartingCards(cardsSlected);
            break;

        case 4:
            setCardPools();
            let shf4 = document.createElement('div');
            shf4.classList.add('shelf');
            cardsLeftToSelect = 1;
      

            for(let i in [1,2]){
                let c = Card.getCardDiv(rareCards.shift());
                
                c.onpointerdown = () =>{
                    let cd = {cardName:c.getAttribute('cardName'),cardDiv:c.cloneNode(true)}
                    cardsSlected.push(cd);
                    drawDeck(cardsSlected);
                    stage+=1;
                    displayCardShop(stage);
                }

                shf4.appendChild(c);
                if(i==0){
                    let text = document.createElement('div')
                    text.innerText = "or";
                    text.classList.add('shelfTextDiv');
                    shf4.appendChild(text)
                }
            }
            $('itemPage').appendChild(shf4);

            break;

            case 5:
                let shf5 = document.createElement('div');
                cardsLeftToSelect = 3;
                shf5.classList.add('shelf'); 
                
                let shf6 = document.createElement('div');
                shf6.classList.add('shelf');
                
                let text2 = document.createElement('div');
                text2.classList.add('shelfHeader');
                text2.id = "text";
                text2.innerText = "You Need to select "+cardsLeftToSelect + " more cards"
                shf6.appendChild(text2);
    
                for(let i in [1,2,3,4,5,6]){
                    if(regularCards.length > 0){
                        let c = Card.getCardDiv(regularCards.shift());
                        c.setAttribute('timesSelected',0);
                        c.onpointerdown=()=>{
                            cardsLeftToSelect -= 1;
                            $('text').innerText = "You Need to select "+cardsLeftToSelect + " more cards";
                            console.log("cardsLeft",cardsLeftToSelect);
                            c.style.transform = "scale(1.1)";
                            
                            let timer = setInterval(()=>{
                                c.style.transform = '';
                                clearInterval(timer);
                            },300)
    
                            let cd = {cardName:c.getAttribute('cardName'),cardDiv:c.cloneNode(true)}
                            cardsSlected.push(cd);
                            
                            drawDeck(cardsSlected);
    
                            if(c.getAttribute('timesSelected') < 1){
                                c.setAttribute('timesSelected',1);
    
                            }else{
                                c.onpointerdown = null;
                                c.style.opacity = '0';
                            }
    
                           
    
                            if(cardsLeftToSelect <= 0){
                                stage+=1;
                                displayCardShop(stage);
                            }
                        }
                        shf5.appendChild(c);
                    }
    
                }
                $('itemPage').appendChild(shf6);
                $('itemPage').appendChild(shf5);
                break;
            case 6:
                doneWithStartingCards(cardsSlected);
                break;
    }
}

function drawDeck(cards){
    clearElement($('cardShopDeck'));
    for(let i of cards){
        i.cardDiv.style.transform = '';
        $('cardShopDeck').appendChild(i.cardDiv);
    }
}

//end of card picking



// this function is run when the player is done selecting their starting deck and is ready to play
export function doneWithStartingCards(cards){
    $('cardShop').classList.remove('onscreen');
    $('playArea').classList.add('onscreen');
    
    let deck = [];
    for(let i in cards){
        deck.push(DataManager.getSpecificCard(cards[i].cardName))
    }

    socket.emit('playerSelectedCards', roomId, socketId, deck);
    socket.emit('ready', roomId, socketId);
    
    AnimationHandler.backgroundTextClientSide("WaitingForOtherPlayer","Waiting for other player...")
    // @viktor at here, maybe change to another section that is just a blank waiting screen
}

export function sacrificeCard(column){
    socket.emit('playerSacrificeCard', roomId, socketId, column);
    displayPlayCardAreaOnSync = true;
}

export function chooseCard(cardType){
    socket.emit('playerDrawCard', roomId, socketId, cardType);
    AnimationHandler.backgroundTextClientSide("DrawCard","Draw "+itemsLeftToChoose+" Card" + (itemsLeftToChoose == 1 ? "" : "s"))
    if(itemsLeftToChoose <= 1){
        AnimationHandler.backgroundTextClientSide("PlayCard","Play Your Hand")
        displayPlayCardAreaOnSync = true;
        playerPickingCard = false;
        Main.clearElement(this.actionSlotsHTMLHandle);
    }
    
    
}

export function cardPlayed(cardIndex,col){
    playerData.hand.splice(cardIndex,1);
    UI_Handler.drawHand(playerData.hand);
    displayPlayCardAreaOnSync = true;
    socket.emit('playerPlayCard', roomId, socketId, cardIndex, col);
    
}

export function endTurn() {
    AnimationHandler.backgroundTextClientSide("WaitForTurn","Wait Your Turn")

    $('endTurnBtn').classList.remove('displaying');
    $('sacrificeCardBtn').classList.remove('displaying');
    currentlyYourTurn = false;
    displayPlayCardAreaOnSync = true;
    socket.emit('playerEndTurn', roomId, socketId);
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

//neccessary Util functions
function fix(txt) { // strips off bad characters, mostly for chat
    return txt.replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

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
export function getCurrentturn(){
    return currentTurn;
}
export function getPlayerPickingCard(){
    return playerPickingCard;
}
export function cloneObject(obj){
    return JSON.parse(JSON.stringify(obj));
}

export function setItemsLeftToChoose(a){itemsLeftToChoose += a;}
export function getItemsLeftToChoose(){return itemsLeftToChoose;}