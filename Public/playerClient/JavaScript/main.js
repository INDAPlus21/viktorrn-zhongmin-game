import * as Card from './cards.js';
import * as UIHandler from './uiHandler.js';
import * as CardLib from '../../baseClasses/cardLib.js';

let card = [1,2,3,4,5,6,7];
let UI_Handle = new UIHandler.UIHandler($('handPoint'),$('cardPlacementSlots'),$('cardSelectionPage'),$('cardPickZone')); 
let CardLibrary = new CardLib.CardLib('url');
let endTurnBtn = $('endTurnBtn')

window.onload = function(){
    UI_Handle.drawHand(card);
    UI_Handle.drawDropZones();
    //UI_Handle.displayCardSelectionZone([1,2,3,4,5,6,7,8,9,10],'startingPhase');
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