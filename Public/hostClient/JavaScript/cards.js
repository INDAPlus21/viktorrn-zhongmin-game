export function getCardDiv(card){
    let div = document.createElement('div');
    div.classList.add('card');
    div.setAttribute('cardName',card.name);

    let hdiv = document.createElement('div');
    hdiv.innerText = card.name;
    hdiv.classList.add('name')
    div.appendChild(hdiv);

    let dmg = document.createElement('div');
    dmg.innerText = card.damage;
    dmg.classList.add('damage')
    div.appendChild(dmg);

    let hp = document.createElement('div');
    hp.innerText = card.health;
    hp.classList.add('health')
    div.appendChild(hp);

    let cost = document.createElement('div');
    for(let i = 0; i < card.cost;i++){
        let blood = document.createElement('div');
        blood.classList.add('blood');
        cost.appendChild(blood);
    }
    cost.classList.add('cost')
    div.appendChild(cost);

    let description = document.createElement('div');
    description.innerText = "effect name";
    description.classList.add('description')
    div.appendChild(description);

    return div;
}