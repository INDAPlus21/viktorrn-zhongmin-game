import * as Card from '../../dataManager/cards.js';
import * as Main from './main.js';

export class UIHandler{ 

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

    // for gameLogic

    displayActionSlots(state,deck,board,hand,columnAmount){
        Main.clearElement(this.actionSlotsHTMLHandle);
        let div;
        switch(state){

            case 'playCards':
                for(let i = 0; i<columnAmount; i++){
                    
                    let div =  document.createElement('div');
                    div.classList.add('cardSlot');
                    if(board != null && board[i] != null){ 
                        let card = Card.getCardDiv(board[i]);
                        card.setAttribute('cardIndex',i);
                        card.style.pointerEvents = "none";
                        if(board[i].shieldBroken != undefined && board[i].shieldBroken == false){
                            card.style.borderTop = "5px solid #6C80FF";
                        }
                        if(card.age == 0) div.style.opacity = 0.7;
                        div.appendChild(card);
                    }
                    this.actionSlotsHTMLHandle.appendChild(div);
                }
            break;

            case 'chooseCard':
                if(hand.length >= 7) this.displayActionSlots('playCards',[],board); 
                 
                let vessel = document.createElement('div');
                vessel.setAttribute('class','card');
                vessel.onpointerdown = () =>{
                    Main.clearElement(this.actionSlotsHTMLHandle);
                    Main.chooseCard('Vessel');
                }
                let name = document.createElement('div');
                name.innerText = "Vessel";
                name.setAttribute('class','name')
                vessel.appendChild(name);
                this.actionSlotsHTMLHandle.appendChild(vessel);

                try{
                    if(deck.length > 0){
                        let creature =  document.createElement('div');
                        creature.setAttribute('class','card');
                        creature.onpointerdown = () =>{
                            Main.clearElement(this.actionSlotsHTMLHandle);
                            Main.chooseCard('Creature');
                        }
                        name = document.createElement('div');
                        name.innerText = "Creature";
                        name.setAttribute('class','name')
                        creature.appendChild(name);
                        this.actionSlotsHTMLHandle.appendChild(creature);
                    }
                }catch(error){console.log(error)}
                    
            break;

            case 'waitingForTurn':
                div =  document.createElement('div');
                div.setAttribute('class','waitTingForTurn');
                div.innerText = "Waiting For Turn...";
                this.actionSlotsHTMLHandle.appendChild(div);
            break;

            case 'waitingForOtherPlayer':
                div =  document.createElement('div');
                div.setAttribute('class','waitTingForTurn');
                div.innerText = "Waiting On Other Player...";
                this.actionSlotsHTMLHandle.appendChild(div);
            break;
        
        }
    }

    activateDropZone(board){
        for(let i in board){
            let el = this.actionSlotsHTMLHandle.children[i];
            if(board[i] == null){
                console.log(board[i])
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
                el.style.transform = ''; 
                el.style.border = '';
            }
        }
    }

    suggestSacrifices(board){
        
        // change background text to indicate its sacrificing time
        if(!Main.getPlayerTurn()) return;
        document.getElementById('backgroundTextText').innerHTML="MAKE YOUR CHOICE";

        for(let i in board){
           try{
            let el = this.actionSlotsHTMLHandle.children[i];
            if(board[i] != null){
                
                if(board[i].lastSacrificedOnTurn != Main.getCurrentturn()){
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
                        
                        Main.sacrificeCard(i);
                        
                        //trigger animation or effect here
                        console.log("sacced card",el);
                        let rebirth = false;
                        for(let a of board[i].amulets){
                            if(a == "Rebirth") rebirth = true;
                        }

                        if(!rebirth) el.firstChild.remove();
                        
                        this.disableDropZone(); 
                    } 
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

        // normal playing mode
        if(!Main.getPlayerTurn()) return; 
        document.getElementById('backgroundTextText').innerHTML="PLAY YOUR HAND";

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
                console.log("card clicked")
                Main.getUIHandler().selectedHandCard(card);
            }
            
            this.handHTMLHandle.appendChild(card);
        }
    }

    selectedHandCard(card){
        //animate card klicked
    if(Main.getPlayerPickingCard()) return

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
        if(playerData.bloodLevel >= playerData.hand[card.getAttribute('cardindex')].cost && !Main.getPlayerPickingCard())
            this.activateDropZone(Main.getPlayerData().board);
        else{
            this.disableDropZone();
            console.log("need to sac a card or youre picking cards");
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