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
    return div;
}

export function pickCardKlicked(e){
    this.onpointerdown = Main.getUIHandler().selectedPickCard();
}

export function handCardHover(e){
    this.onpointerdown = handCardSelected;
}

export function handCardStopHover(e){
    this.onpointerdown = null;
}

function handCardSelected(e){
    if(Main.getUIHandler().currentCardSelected == null)
        Main.getUIHandler().selectedHandCard(this);
}



