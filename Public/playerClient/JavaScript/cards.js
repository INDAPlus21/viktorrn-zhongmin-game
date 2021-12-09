import * as Main from './main.js';

export class Card{
    constructor(){
        
    }
}

export function getCardDiv(card){
    let div = document.createElement('div');
    div.setAttribute('class','card');
    div.setAttribute('cardName',card.name);

    let hdiv = document.createElement('div');
    hdiv.innerText = card.name;
    hdiv.setAttribute('class','name')
    div.appendChild(hdiv);

    let dmg = document.createElement('div');
    dmg.innerText = card.damage;
    dmg.setAttribute('class','damage')
    div.appendChild(dmg);

    let hp = document.createElement('div');
    hp.innerText = card.health;
    hp.setAttribute('class','health')
    div.appendChild(hp);

    let cost = document.createElement('div');
    cost.innerText = 'Cost: '+ card.cost;
    cost.setAttribute('class','cost')
    div.appendChild(cost);

    return div;
}

export function pickCardKlicked(e,phase){
    switch(phase){
        case 'startingPhase':
            e.onpointerdown = Main.getUIHandler().selectedStartingCard(e)
            break;
        case 'breakPhase':
            e.onpointerdown = Main.getUIHandler().selectedPickCard(e);
            break;
    }
    
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



