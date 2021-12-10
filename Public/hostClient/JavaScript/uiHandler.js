import * as Card from './cards.js';
import * as Main from './main.js';

export class UIHandler{
    cardPickingPhase = null;

    constructor(cardSelectionPageHTMLHandle,cardPickZoneHTMLHandle,scaleHTMLHandle){
        this.cardSelectionPageHTMLHandle = cardSelectionPageHTMLHandle;
        this.cardPickZoneHTMLHandle = cardPickZoneHTMLHandle;
        this.scaleHTMLHandle = scaleHTMLHandle;
    }

    //for card picking

    displayCardSelectionPage(cards){
        Main.clearElement(this.cardPickZoneHTMLHandle);
        this.cardSelectionPageHTMLHandle.style.top = '0px';
        for(let i in cards){
            let div = getCardDiv(i);
            div.id = ('pickCardIndex'+i);
            div.setAttribute('pickCardIndex',i);
            this.cardPickZoneHTMLHandle.appendChild(div)
        }
    }

    hideCardSelectionPage(){
        this.cardSelectionPageHTMLHandle.style.top = '-100%';
    }

    cardPicked(){

    }

    // card display
    getCardDiv(card){
        let div = Card.getCardDiv(card);
        div.setAttribute('class','card');
        return div;
    }

    displayBoard(boardInfo){
        Main.clearElement($('playerBoard'))
        for(let i in [1,2,3,4]){
            let p1Slot =  document.createElement('div');
            p1Slot.classList.add('cardSlots');
            let p2Slot =  document.createElement('div');
            p2Slot.classList.add('cardSlots');
            Main.$('playerBoard').appendChild(p1Slot);
            Main.$('playerBoard').appendChild(p2Slot);
        }

        for(let c in boardInfo.player1){
            if(boardInfo.player1[c] !== null){
                let card = this.getCardDiv(boardInfo.player1[c]);
                Main.$('player1Board').appendChild(card);
            }
        }

        for(let c in boardInfo.player2){
            if(boardInfo.player2[c] !== null){
                let card = this.getCardDiv(boardInfo.player2[c]);
                Main.$('player2Board').appendChild(card);
            }
        }
    }
}
