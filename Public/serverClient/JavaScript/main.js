

class GameObject{
    players = []

}
class PlayerObject{
    playerNumber = 0;
    cardsPlayed = []
    constructor(){

    }
}

class Card{
    constructor(cardHTML,cardData) {
        this.HTMLKey = cardHTML;
        this.cardData = cardData;
    }
}


window.onload = function(){

}

function displayCardPickingPage(){

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