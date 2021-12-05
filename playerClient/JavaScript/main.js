import * as Card from './cards.js'; 
import * as UIHandler from './uiHandler.js';

let card = [1,2,3,4,5];
let UI_Handle = new UIHandler.UIHandler($('handPoint'),$('cardPlacementSlots')); 

window.onload = function(){
    UI_Handle.drawHand(card);
    UI_Handle.drawDropZones();
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