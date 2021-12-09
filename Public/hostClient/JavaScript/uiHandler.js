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

}

function getCardDiv(card){
    let div = document.createElement('div');
    div.setAttribute('class','card');
    div.innerHTML = card;
    return div;
}