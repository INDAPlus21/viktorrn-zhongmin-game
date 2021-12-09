import * as Main from '../playerClient/JavaScript/main.js';
export class CardLib{
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
        console.log(data,self);
    }



    getGameCardTable(){

    }

    getSpecificCard(name){
        
    }

}