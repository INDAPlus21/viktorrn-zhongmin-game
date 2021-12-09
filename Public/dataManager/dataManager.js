export class DataManager{
    jsonPath = '../gameData/';

    constructor(){
        this.cardLibrary = new Array();
        this.sigilLibrary = new Array();
    }

    readJSONFile(filePath,callBack,self){
        fetch(filePath).then(result => result.json())
        .then(result => {
            callBack(result,self);
            return true;
        })
        .catch(error =>{
            console.log('Error:',error)
            return false;
        })
    }

    readSigilDataFromJSON(){

    }

    readCardDataFromJSON(filePath){
        this.readJSONFile(this.jsonPath+'cards.json',this.handleCardData,this);
    }

    handleCardData(data,self){
        for(let i in data.cards){
            self.cardLibrary.push(data.cards[i]);
        }
        console.log(data,self);
    }



    getGameCardTable(){

    }

    getSpecificCard(name){
        
    }

    cloneObject(obj){
        return JSON.parse(JSON.stringify(obj));
    }

}