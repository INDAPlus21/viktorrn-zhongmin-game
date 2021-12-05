import * as Card from './cards.js';
import * as Main from './main.js';

export class UIHandler{
    handHTMLHandle = null;
    currentCardSelected = null;
    currentDisplayedCard = null;
    constructor(handHTMLHandle){
        this.handHTMLHandle = handHTMLHandle;
    }

    drawDropZones(){
        
    }

    drawHand(cards){
        for(let i in cards){
            this.handHTMLHandle.appendChild(Card.getCardDiv(i));
        }
    }

    selectedCard(card){
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
          copy.style.top = pos.top - 150 + 'px';
          copy.style.transform = 'scale(2) translateX(-25%)';
          window.onpointerdown = ()=>{this.droppedCard()}
          clearInterval(animation);
        }, 100);

        this.currentDisplayedCard = copy;  

        this.currentCardSelected = card;
        this.currentCardSelected.style.visibility = 'hidden'; //visible
        this.currentCardSelected.style.margin = '0 35px 0 5px';
  
        console.log(card);
    }

    droppedCard(){
        this.currentDisplayedCard.style.left = this.currentDisplayedCard.getAttribute('ogLeft') + 'px';
        this.currentDisplayedCard.style.top = this.currentDisplayedCard.getAttribute('ogTop') + 'px';
        this.currentDisplayedCard.style.transform = 'scale(1) translateX(0)';

        var animation = setInterval(() => { //used for display animation
            document.body.removeChild(Main.getUIHandler().currentDisplayedCard)
            window.onpointerdown = null;
            this.currentCardSelected.style.margin ="";
            this.currentCardSelected.style.visibility = ''; //visible
            this.currentDisplayedCard = null;
            this.currentCardSelected = null;
            clearInterval(animation);
          }, 200);

    }
}