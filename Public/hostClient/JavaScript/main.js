import * as UIHandler from './uiHandler.js';
import * as DataManagerImport from '../../dataManager/dataManager.js';

class GameObject{
    players = []
    playerTurn = null; // can be either 0 or 1 depending on player based on index in players  
    currentPhase;

    createPlayer(){
        if(this.players.length >= 1) return false;
        let player = new PlayerObject();
        this.players.push(player);
        return true;
    }
}

let UI_Handler = new UIHandler.UIHandler($('cardSelectionPage'),$('cardPickZone'));
let DataManager = new DataManagerImport.DataManager();
let boolToggle = false;
let cards = [1,2,3,4,5,6]

window.onload = function(){
}

//neccessary Util functions
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
    return UI_Handle;
}
export function getCardLib(){
    return CardLibrary;
}
export function cloneObject(obj){
    return JSON.parse(JSON.stringify(obj));
}