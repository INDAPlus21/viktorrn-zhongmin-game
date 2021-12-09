import * as Card from './cards.js';
import * as UIHandler from './uiHandler.js';
import * as DataManagerImport from '../../dataManager/dataManager.js';

let yourTurn = false;
let UI_Handler = new UIHandler.UIHandler($('handPoint'),$('cardPlacementSlots'),$('cardSelectionPage'),$('cardPickZone')); 
let DataManager = new DataManagerImport.DataManager();

let endTurnBtn = $('endTurnBtn')


window.onload = function(){
    DataManager.parseCardDataFromJSON(DataManager.jsonPath+'cards.json',DataManager,(Manager = DataManager) => {
        let cards = []
        for(let i of DataManager.startingCards) cards.push(DataManager.getSpecificCard(i));
        UI_Handler.displayCardSelectionPage(cards,"startingPhase");
    })
}


//neccessary Util functions
export function doneWithStartingCards(){
    UI_Handler.hideCardSelectionPage();
    console.log("pickedCards")
}

export function $(el) { return document.getElementById(el) };
export function getOffset( el ) {
    var _x = 0;
    var _y = 0;
    while( el && !isNaN( el.offsetLeft ) && !isNaN( el.offsetTop ) ) {
        _x += el.offsetLeft - el.scrollLeft;
        _y += el.offsetTop - el.scrollTop;
        el = el.offsetParent;
    }
    return { top: _y, left: _x };
}
export function clearElement(el){
    while(el.firstChild){
        el.removeChild(el.firstChild);
    }
}
export function getUIHandler(){
    return UI_Handler;
}
export function getDataManager(){
    return DataManager;
}
export function cloneObject(obj){
    return JSON.parse(JSON.stringify(obj));
}