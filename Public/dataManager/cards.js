export function getCardDiv(card){
    let div = document.createElement('div');
    div.setAttribute('class','card');
    div.setAttribute('cardName',card.name);
   
    let image = document.createElement('div');
    image.classList.add('image');
    div.appendChild(image);

    let imageSword = document.createElement('div');
    imageSword.classList.add('damageIcon');
    div.appendChild(imageSword);

    let imagehealth = document.createElement('div');
    imagehealth.classList.add('healthIcon');
    div.appendChild(imagehealth);

    let factionSymbol = document.createElement('div');
    factionSymbol.classList.add('factionSymbol');
    switch(card.faction){
        case 'Humanity':
            factionSymbol.innerText = "H";
            break;

        default:
            factionSymbol.innerText = "N";
            break;
    }

    div.appendChild(factionSymbol);

    let hdiv = document.createElement('div');
    hdiv.innerText = card.name;
    hdiv.classList.add('name')
    div.appendChild(hdiv);

    let dmg = document.createElement('div');
    dmg.innerText = card.damage;
    dmg.setAttribute('class','damage')
    div.appendChild(dmg);

    let hp = document.createElement('div');
    hp.innerText = card.health;
    hp.setAttribute('class','health')
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
    let msg = "";
    for(let a of card.amulets){
        switch(a){
            case 'Rush':
                msg += "RS";
                break;
            case 'High Block':
                msg += "HB ";
                break;
            
            case 'Shield':
                msg += "SH ";
                break;
            case 'Drunk':
                msg += "DR ";
                break;
            case 'Mirror':
                msg += "MR ";
                break;
            case 'Marching':
                msg += "MA "
                break;
            case 'Valiant Hearts':
                msg += "VH ";
                break;
            case 'Reach':
                msg += "RH ";
                break;
            case 'Rebirth':
                msg += "RB ";
                break;
            case 'Flying':
                msg += "FL ";
                break;
            case 'Hound Master':
                msg += "HM ";
                break;
            case 'Headed Hunter':
                msg += "HH ";
                break;
            case 'Growth':
                msg += "GW ";
                break;
            default:
                msg+="";
                break;
        }
        
        
    } 
    description.innerText = msg;
    description.classList.add('description')
    div.appendChild(description);

    if(card.rarity === "rare") {
        let bg = document.createElement('div');
        bg.classList.add('rareCardBackground');
        div.appendChild(bg);
      }
  

    return div;
}