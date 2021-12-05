import * as Card from './cards.js'; 
import * as UIHandler from './uiHandler.js.js';
import * as UtilFunctions from './utilityFunctions.js';

let card = [1,2,3,4,5];
let UI_Handle = new UIHandler.UIHandler(UtilFunctions.$('deckPoint')); 

window.onload = function(){
    UI_Handle.drawHand(card);
}

//neccessary Util functions
