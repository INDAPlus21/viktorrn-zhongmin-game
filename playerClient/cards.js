import * as Main from './main.js';
export class Card{
    constructor(){

    }
}

export function getCardDiv(card){
    let div = document.createElement('div');
    div.setAttribute('class','card');
    div.setAttribute('handPosition',card);
    div.innerHTML = card;
    div.onpointerenter = cardHover;
    div.onpointerleave = cardStopHover;
    return div;
}

function cardHover(e){
    this.onpointerdown = cardSelected;
}

function cardStopHover(e){
    this.onpointerdown = null;
}

function cardSelected(e){
    if(Main.getUIHandler().currentCardSelected == null)
        Main.getUIHandler().selectedCard(this);
}



