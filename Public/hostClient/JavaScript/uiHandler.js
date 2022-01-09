import * as Main from './hostSocket.js';
import * as Card from '../../dataManager/cards.js';
import { $ } from '../../playerClient/JavaScript/main.js';
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

    // card display
    getCardDiv(card){
        let div = Card.getCardDiv(card);
        div.setAttribute('class','card');
        return div;
    }



    displayBoard(boardInfo,columnAmount,playerInfo){
        
        Main.clearElement(Main.$('playerBoard'))
        let p1Slot =  document.createElement('div');
        p1Slot.id = 'player1Board';
        let p2Slot =  document.createElement('div');
        p2Slot.id = 'player2Board';
        Main.$('playerBoard').appendChild(p1Slot);
        Main.$('playerBoard').appendChild(p2Slot);
        
        for(let i = 0; i< columnAmount; i++){
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
                let age = boardInfo.player1[c].age
                card.id = "p1Card_"+c;
                card.setAttribute('age',age);
                //console.log("card",boardInfo.player1[c],"player")
                if(boardInfo.player1[c].shieldBroken != undefined && boardInfo.player1[c].shieldBroken == false){
                    card.style.borderBottom = "5px solid #6C80FF";
                }
                if(age == 0) card.style.opacity = 0.7;
                Main.$('p1SlotIndex'+c).appendChild(card);
            }
        }

        for(let c in boardInfo.player2){
            if(boardInfo.player2[c] !== null){
                let card = this.getCardDiv(boardInfo.player2[c]);
                let age = boardInfo.player2[c].age
                card.id = "p2Card_"+c;
                card.setAttribute('age',age);
                //console.log("card",boardInfo.player2[c])
                if(boardInfo.player2[c].shieldBroken != undefined && boardInfo.player2[c].shieldBroken == false){
                    card.style.borderTop = "5px solid #6C80FF";
                }
                if(age == 0) card.style.opacity = 0.7;
                Main.$('p2SlotIndex'+c).appendChild(card);
            }
        }
        
        let scale = document.createElement('div');
        let p1Scale = document.createElement('div');
        let p2Scale = document.createElement('div');
        scale.id = "scaleDiv";
        p1Scale.id ="player1Scale";
        p2Scale.id = "player2Scale";
        
        p1Scale.innerText = boardInfo.p2damage;   
        p2Scale.innerText = boardInfo.p1damage; 
        
        scale.appendChild(p1Scale);
        scale.appendChild(p2Scale);

        Main.$('playerBoard').appendChild(scale);

        let p1Name = document.createElement('div');
        p1Name.id= 'player1Name';
        p1Name.innerText = "-"+ playerInfo.player1.name +"-"
        let p2Name = document.createElement('div');
        p2Name.id= 'player2Name';
        p2Name.innerText = "-"+ playerInfo.player2.name +"-"
        
        Main.$('playerBoard').appendChild(p1Name);
        Main.$('playerBoard').appendChild(p2Name);
        
    }

    updateCard(oldCard,cardData){
        let newCard = Card.getCardDiv(cardData);
        newCard.id = oldCard.id;
        if(oldCard.getAttribute("age") == 0) newCard.style.opacity = "0.7";
        let parent = oldCard.parent;
        parent.replaceChild(newCard,oldCard);
    }

    killCard(card){

    }
}
