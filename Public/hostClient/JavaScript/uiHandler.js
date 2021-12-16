import * as Main from './hostSocket.js';
import * as Card from '../../dataManager/cards.js';
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
        
        Main.clearElement(Main.$('playerBoard'))
        let p1Slot =  document.createElement('div');
        p1Slot.id = 'player1Board';
        let p2Slot =  document.createElement('div');
        p2Slot.id = 'player2Board';
        Main.$('playerBoard').appendChild(p1Slot);
        Main.$('playerBoard').appendChild(p2Slot);
        
        for(let i in [1,2,3,4]){
            let div1 = document.createElement('div');
            div1.classList.add('cardSlots')
            div1.id = 'p1SlotIndex'+i;

            let div2 = document.createElement('div');
            div2.classList.add('cardSlots')
            div2.id = 'p2SlotIndex'+i;

            Main.$('player1Board').appendChild(div1);
            Main.$('player2Board').appendChild(div2);  
        }

        for(let c in boardInfo.player1){
            if(boardInfo.player1[c] !== null){
                let card = this.getCardDiv(boardInfo.player1[c]);
                if(boardInfo.player1[c].age == 0) card.style.opacity = 0.7;
                Main.$('p1SlotIndex'+c).appendChild(card);
            }
        }

        for(let c in boardInfo.player2){
            if(boardInfo.player2[c] !== null){
                let card = this.getCardDiv(boardInfo.player2[c]);
                if(boardInfo.player2[c].age == 0) card.style.opacity = 0.7;
                Main.$('p2SlotIndex'+c).appendChild(card);
            }
        }
        
        let scale = document.createElement('div');
        let p1Scale = document.createElement('div');
        let p2Scale = document.createElement('div');
        scale.id = "scaleDiv";
        p1Scale.id ="player1Scale";
        p2Scale.id = "player2Scale";
        
        p1Scale.innerText = boardInfo.p1damage;   
        p2Scale.innerText = boardInfo.p2damage; 
        
        scale.appendChild(p1Scale);
        scale.appendChild(p2Scale);

        Main.$('playerBoard').appendChild(scale);
    }
}
