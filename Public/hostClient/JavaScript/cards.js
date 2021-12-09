
export function getCardDiv(card){
    let div = document.createElement('div');
    div.setAttribute('class','card');
    div.innerHTML = card;
    return div;
}