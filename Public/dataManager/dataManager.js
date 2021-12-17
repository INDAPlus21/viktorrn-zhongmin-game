export class DataManager{
    jsonPath = '../gameData/';

    constructor(){
        this.cardLibrary = new Array();
        this.startingCards = new Array();
        this.sigilLibrary = new Array();
    }

    parseCardDataFromJSON(filePath,lib,callback){
        fetch(filePath).then(result => result.json())
        .then(result => {
            for(let i in result.cards){
                lib.cardLibrary.push(result.cards[i]);
            }
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
        for(let i in this.startingCards){
            cards.push(this.getSpecificCard(this.startingCards[i]));
        }
        return cards;
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