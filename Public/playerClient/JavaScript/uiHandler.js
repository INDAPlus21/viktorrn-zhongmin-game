import * as Card from './cards.js';
import * as Main from './main.js';

export class UIHandler{ 

    amountOfStartingCards = 4;
    cardsPicked;
    cardPickingPhase = null;

    currentCardSelected = null;
    currentDisplayedCard = null;
    cardWasPlayed = false;

    cardsPlayed = null;

    constructor(handHTMLHandle,actionSlotsHTMLHandle,cardSelectionPageHTMLHandle,cardPickZoneHTMLHandle,selectedCardsHTMLHandle,playerBloodDisplayHTMLHandle){
        this.handHTMLHandle = handHTMLHandle;
        this.actionSlotsHTMLHandle = actionSlotsHTMLHandle;
        this.cardSelectionPageHTMLHandle = cardSelectionPageHTMLHandle;
        this.cardPickZoneHTMLHandle = cardPickZoneHTMLHandle;
        this.selectedCardsHTMLHandle = selectedCardsHTMLHandle;
        this.playerBloodDisplayHTMLHandle = playerBloodDisplayHTMLHandle;
    }

    //for card picking
    displayCardSelectionPage(cards){
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

    drawSelectedCards(cards){
        Main.clearElement(this.handHTMLHandle)
        for(let i in cards){
            let card = Card.getCardDiv(cards[i]);
            card.setAttribute('cardIndex',i);
            //handle klick event
            card.onpointerover = () => {
                
                card.onpointerdown = (UIHandler = this) => {
                    console.log("card klicked",UIHandler);
                    if(UIHandler.currentCardSelected === null) UIHandler.selectedHandCard(card);
                }
            }
            //handle leave event
            card.onpointerleave = () =>{
                card.onpointerdown = null;
            }
            
            this.handHTMLHandle.appendChild(card);
        }
    }

    // for gameLogic

    displayActionSlots(state,deck,board){
        Main.clearElement(this.actionSlotsHTMLHandle);
        let div;
        switch(state){

            case 'playCards':
                for(let i in [1,2,3,4]){
                    
                    let div =  document.createElement('div');
                    div.classList.add('cardSlot');
                    if(board != null && board[i] != null){ 
                        let card = Card.getCardDiv(board[i]);
                        card.setAttribute('cardIndex',i);
                        card.style.pointerEvents = "none";
                        if(card.age == 0) div.style.opacity = 0.7;
                        div.appendChild(card);
                    }
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

                    try{
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
                    }catch(error){console.log(error)}
                    
            break;

            case 'waitingForTurn':
                div =  document.createElement('div');
                div.setAttribute('class','waitTingForTurn');
                div.innerText = "Waiting For Turn...";
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
            }else{
                el.onpointerdown = null;
                el.onpointerover = null,
                el.onpointerout = null;
                el.style.transform = 'scale(1.1)'; 
                el.style.border = '';
            }
        }
    }

    suggestSacrifices(board){
        console.log("suggest sac",board)
        for(let i in board){
           try{
            let el = this.actionSlotsHTMLHandle.children[i];
            if(board[i] != null){
                el.style.transform = 'scale(1.1)';
                console.log(el);
                el.onpointerover = () =>{
                    el.style.border = '10px solid rgb(220, 220, 220)';
                    el.style.transform = 'scale(1.3)';
                }
                el.onpointerout = () =>{
                    el.style.transform = 'scale(1.1)'; 
                    el.style.border = '';
                }
                el.onpointerdown = () =>{
                    
                    Main.sacrificeCard(i);
                    
                    //trigger animation or effect here
                    console.log("sacced card",el);
                    el.firstChild.remove();
                    this.disableDropZone(); 
                } 
            }
           }catch(err){
               console.log(err)
           } 
        }
    
        let timer = setInterval(()=>{
            window.onpointerdown = this.disableDropZone; 
            clearInterval(timer);
        },100)
        
    }

    disableDropZone(){
        try{
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
        }catch(error){console.log("error",error)}
        
    }

    drawBloodLevel(level){
        Main.clearElement(this.playerBloodDisplayHTMLHandle);
        for(let i = 0; i < level; i++){
            let div = document.createElement('div');
            div.classList.add('blood');
            this.playerBloodDisplayHTMLHandle.appendChild(div);
        }
    }

    //for handling card actions

    drawHand(cards){
        Main.clearElement(this.handHTMLHandle)
        for(let i in cards){
            let card = Card.getCardDiv(cards[i]);
            card.setAttribute('cardIndex',i);
            //handle klick event 
            card.onpointerdown = () => {
                Main.getUIHandler().selectedHandCard(card);
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
        if(!Main.getPlayerTurn()) return
        let playerData = Main.getPlayerData();
        if(playerData.bloodLevel >= playerData.hand[card.getAttribute('cardindex')].cost)
            this.activateDropZone(Main.getPlayerData().board);
        else{
            this.disableDropZone();
            console.log("need to sac a card")
        }
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
                    this.currentCardSelected.style.visibility = ''; 
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
        Main.getPlayerData().board[col] = 0;

        var animation = setInterval((el = target,dispCard = displayCard,card = selectedCard) => { //used for display animation
            
            el.onpointerdown = null;
            window.onpointerdown = null;
            document.body.removeChild(dispCard);
            card.style.visibility = '';
            card.style.margin = '';
            card.onpointerover = null;
            card.onpointerdown = null;
            card.onpointerout = null;
            card.style.opacity = 0.7;
            card.style.pointerEvents = "none";
            el.appendChild(card);
            //card.style.opacity = '0';

            Main.getUIHandler().currentCardSelected = null;
            Main.getUIHandler().currentCardSelected = null;
            Main.getUIHandler().cardWasPlayed = false;

            Main.cardPlayed(card.getAttribute('cardIndex'),col);
            
            

            clearInterval(animation);
          }, 150);

    }
}