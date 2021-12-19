export class DataManager{
    jsonPath = '../gameData/';

    constructor(){
        this.cardLibrary = new Array();
        this.regularCards = new Array();
        this.rareCards = new Array();
        this.startingCards = new Array();
    }

    parseCardDataFromJSON(filePath,lib,callback){
        fetch(filePath).then(result => result.json())
        .then(result => {
            for(let i in result.cards){
                for(let c in result.cards[i].regularCards){
                    let card = result.cards[i].regularCards[c];
                    card.faction = result.cards[i].faction;
                    card.rarity = "regular";
                    lib.cardLibrary.push(card);
                    lib.regularCards.push(card);
                    
                }
                for(let c in result.cards[i].rareCards){
                    let card = result.cards[i].rareCards[c];
                    card.faction = result.cards[i].faction;
                    card.rarity = "rare";
                    lib.cardLibrary.push(card);
                    lib.rareCards.push(card);
                }
            }
            console.log("lib",lib)
            for(let c in result.startingCards){
                lib.startingCards.push(result.startingCards[c]);
            }
            callback();
            return true;
        })
        .catch(error =>{
            console.log('Error:',error)
            return false;
        })
    }

    readSigilDataFromJSON(){

    }

    getGameCardTable(){
        let cards = [];
        for(let i in this.cardLibrary){
            cards.push(this.cloneObject(this.cardLibrary[i]))
        }
        return cards;
    }

    getRandomRegularCard(cost){
        
    }

    getRandomRareCard(cost){
        
    }

    getSpecificCard(name){
       for(let c of this.cardLibrary){
           if(c.name === name) return this.cloneObject(c);
       }
       return null;
    }

    cloneObject(obj){
        return JSON.parse(JSON.stringify(obj));
    }

}