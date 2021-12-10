import * as Card from './cards.js';
import * as Main from './main.js';

export class UIHandler{ 

    amountOfStartingCards = 1;
    cardsPicked;
    cardPickingPhase = null;

    currentCardSelected = null;
    currentDisplayedCard = null;
    cardWasPlayed = false;

    cardsPlayed = null;

    constructor(handHTMLHandle,actionSlotsHTMLHandle,cardSelectionPageHTMLHandle,cardPickZoneHTMLHandle){
        this.handHTMLHandle = handHTMLHandle;
        this.actionSlotsHTMLHandle = actionSlotsHTMLHandle;
        this.cardSelectionPageHTMLHandle = cardSelectionPageHTMLHandle;
        this.cardPickZoneHTMLHandle = cardPickZoneHTMLHandle;
    }

    //for card picking
    displayCardSelectionPage(cards,phase){
        this.cardsPicked = [];
        this.cardSelectionPageHTMLHandle.style.top = '0px';
        for(let i in cards){
            let div = Card.getCardDiv(cards[i]);
            div.id = ('pickCardIndex'+i);
            div.setAttribute('pickCardIndex',i);
            div.onpointerdown = () => {
                this.cardsPicked.push(div.getAttribute('cardName'));
                this.disablePickedCard(div.getAttribute('pickCardIndex'),true)
                if(this.cardsPicked.length >= this.amountOfStartingCards) Main.doneWithStartingCards(this.cardsPicked);
            };
            this.cardPickZoneHTMLHandle.appendChild(div)
        }
    }

    hideCardSelectionPage(){
        this.cardSelectionPageHTMLHandle.style.top = '-100%';
    }

    disablePickedCard(card_index,youPicked){
        let card = Main.$('pickCardIndex'+card_index);
        card.onpointerdown = null;
        card.style.opacity = 0;
    }

    // for gameLogic


    displayActionSlots(state,deck){
        Main.clearElement(this.actionSlotsHTMLHandle);
        let div;
        switch(state){

            case 'playCards':
                for(let i in [1,2,3,4]){
                    let div =  document.createElement('div');
                    div.setAttribute('class','cardSlot');
                    this.actionSlotsHTMLHandle.appendChild(div);
                }
            break;

            case 'chooseCard':
                    let squirrel = document.createElement('div');
                    squirrel.setAttribute('class','card');
                    squirrel.onpointerdown = () =>{
                        Main.clearElement(this.actionSlotsHTMLHandle);
                        Main.chooseCard('squirrel');
                    }
                    let name = document.createElement('div');
                    name.innerText = "Squirrel";
                    name.setAttribute('class','name')
                    squirrel.appendChild(name);
                    this.actionSlotsHTMLHandle.appendChild(squirrel);

                    if(deck.length > 0){
                        let beast =  document.createElement('div');
                        beast.setAttribute('class','card');
                        beast.onpointerdown = () =>{
                            Main.clearElement(this.actionSlotsHTMLHandle);
                            Main.chooseCard('beast');
                        }
                        name = document.createElement('div');
                        name.innerText = "Beast";
                        name.setAttribute('class','name')
                        beast.appendChild(name);
                        this.actionSlotsHTMLHandle.appendChild(beast);
                    }
            break;

            case 'waitingForTurn':
                div =  document.createElement('div');
                div.setAttribute('class','waitTingForTurn');
                div.innerText = "Waiting For Turn...";
                this.actionSlotsHTMLHandle.appendChild(div);
            break;

            case 'youLost':
                div =  document.createElement('div');
                div.setAttribute('class','waitTingForTurn');
                div.innerText = "You Lost...";
                this.actionSlotsHTMLHandle.appendChild(div);
            break;

            case 'youWon':
                div =  document.createElement('div');
                div.setAttribute('class','waitTingForTurn');
                div.innerText = "You Won!";
                this.actionSlotsHTMLHandle.appendChild(div);
            break;
        }
    }

    activateDropZone(board){
        for(let i in board){
            let el = this.actionSlotsHTMLHandle.children[i];
            if(board[i] == null){
                el.style.transform = 'scale(1.1)';
                el.onpointerover = () =>{
                    el.style.border = '10px solid rgb(220, 220, 220)';
                    el.style.transform = 'scale(1.3)';
                }
                el.onpointerout = () =>{
                    el.style.transform = 'scale(1.1)'; 
                    el.style.border = '';
                }
                el.onpointerdown = () =>{
                    this.playedCard(i,el);
                } 
            }
        }
    }

    disableDropZone(){
        for(let i in this.actionSlotsHTMLHandle.children){
            let el = this.actionSlotsHTMLHandle.children[i];
            if(el.tagName == 'DIV'){
                el.style.transform = ''; 
                el.style.border = '';
                el.onpointerout = null;
                el.onpointerover = null;
                el.onpointerdown = null;
            }
            
        }
    }

    //for handling card actions

    drawHand(cards){
        Main.clearElement(this.handHTMLHandle)
        for(let i in cards){
            let card = Card.getCardDiv(cards[i]);
            //handle klick event
            card.onpointerover = () => {
                
                card.onpointerdown = () => {
                    console.log("card klicked",Main.getUIHandler())
                    
                    if(Main.getUIHandler().currentCardSelected === null) Main.getUIHandler().selectedHandCard(card);
                }
            }
            //handle leave event
            card.onpointerleave = () =>{
                card.onpointerdown = null;
            }
            
            this.handHTMLHandle.appendChild(card);
        }
    }

    selectedHandCard(card){
        //animate card klicked
        if(this.currentCardSelected == null){
            let pos = Main.getOffset(card); //get pos from original element to use for display animation
            let copy = card.cloneNode(true); //clones card element to create a display copy
            copy.setAttribute('class','highlightCard'); //setting som attributes for display element
            document.body.appendChild(copy);
            copy.setAttribute('ogLeft',pos.left);
            copy.setAttribute('ogTop',pos.top);
            copy.style.left = pos.left + 'px';
            copy.style.top = pos.top + 'px';
            
            var animation = setInterval(() => { //used for display animation
              copy.style.left = '50%';
              copy.style.top = '50%';
              copy.style.transform = 'scale(2) translateX(-25%)';
              window.onpointerdown = ()=>{this.returnHandCard()}
              clearInterval(animation);
            }, 100);
    
            this.currentDisplayedCard = copy;  
    
            this.currentCardSelected = card;
            this.currentCardSelected.style.visibility = 'hidden'; //visible
            this.currentCardSelected.style.margin = '0 35px 0 5px';
        }
       
  
        //activate drop zone
        this.activateDropZone(Main.getPlayerBoard());
    }

    returnHandCard(){
        
        //animation for card
        if(!this.cardWasPlayed){
            try{
                this.currentDisplayedCard.style.left = this.currentDisplayedCard.getAttribute('ogLeft') + 'px';
                this.currentDisplayedCard.style.top = this.currentDisplayedCard.getAttribute('ogTop') + 'px';
                this.currentDisplayedCard.style.transform = 'scale(1) translateX(0)';
            }catch{}            
    
            var animation = setInterval(() => { //used for display animation
                window.onpointerdown = null;   
                try{
                    document.body.removeChild(Main.getUIHandler().currentDisplayedCard)
                    this.currentCardSelected.style.margin ="";
                    this.currentCardSelected.style.visibility = ''; //visible
                    this.currentDisplayedCard = null;
                    this.currentCardSelected = null;
                }catch{}
                clearInterval(animation);
              }, 200);
        }
        
        //deactivate dropzone
        this.disableDropZone();
    }

    playedCard(col,target){
        Main.getUIHandler().cardWasPlayed = true;
        let displayCard = Main.getUIHandler().currentDisplayedCard;
        let selectedCard = Main.getUIHandler().currentCardSelected;
        let pos = Main.getOffset(target); 
        displayCard.style.left = pos.left +'px';
        displayCard.style.top = pos.top + 'px';
        displayCard.style.transform = '';

        Main.getUIHandler().disableDropZone();
        Main.getPlayerBoard()[col] = 0;

        var animation = setInterval((el = target,dispCard = displayCard,card = selectedCard) => { //used for display animation
            
            el.onpointerdown = null;
            window.onpointerdown = null;
            document.body.removeChild(dispCard);
            card.style.visibility = '';
            card.style.margin = '';
            card.onpointerover = null;
            card.onpointerdown = null;
            card.onpointerout = null;
            el.appendChild(card);
            card.style.opacity = '0';

            Main.getUIHandler().currentCardSelected = null;
            Main.getUIHandler().currentCardSelected = null;
            Main.getUIHandler().cardWasPlayed = false;

            Main.cardPlayed(card.getAttribute('cardName'),col);
            
            

            clearInterval(animation);
          }, 150);

    }
}