

export async function takeTurn(playerInfo,boardInfo,turn){
    let actions = [];
    //  actions
    //  pull human card
    //
    //
    //

    let hand = playerInfo.player1.hand;
    let humanCards = [];

    for(let c in hand){
        if(hand[c].name == "Human"){
            humanCards.push(hand[c]);
            hand.splice(c,1);
        }
    }

    let blood = playerInfo.player1.blood;
    let deck = playerInfo.player1.remainingDeck;
    let yourBoard = boardInfo.player1;
    let enemyBoard = boardInfo.player2;

    let resourcesAmount = blood + humanCards.length;
    
    /*if(resourcesAmount < findCheapestCard(hand)){
        humanCards += 1;
    }*/

    let treathMap = calcThreatBoard(enemyBoard,yourBoard);

    console.log("threat map",treathMap);
    //chooseCardToDraw(blood,hand,humanCards,deck);
}

function findCheapestCard(hand){
    if(hand.length == 0) return -1;
    let cost = hand[0].cost; 
    for(let c of hand){
        if(c.cost > cost) cost = c.cost;
    }
    return cost;
}

function calcThreatBoard(enemyBoard,yourBoard){
    let threatMap = [];
    for( let r in enemyBoard ){
        console.log("row",r)
        if(enemyBoard[r] == null){
            threatMap.push(0)
            continue;
        }
        console.log()
        let enemyCard = enemyBoard[r];
        threatMap.push( enemyCard.damage + 1 )
    }
    return threatMap;
}

function compareCards(yourCard,opposingCard){
    
    let score = 0;
    let damageTimes = 1;
    
    let remainingHP = yourCard.health - opposingCard.damage * damageTimes;

    let turnsToDie = remainingHP / opposingCard.damage;
    let turnsToKill = opposingCard.health / yourCard.damage; 

    let result = (turnsToDie - turnsToKill)
    score = result;
    
    return score; 
}

function drawOneCard(playerObj) {
    if (playerObj.remainingDeck.length > 0)
    playerObj.hand.push(playerObj.remainingDeck.shift());
    // shift() takes one element from the array and pushes it into the player's hand
  }

function sortHighest(list){
    let res = [];
    res.push(list[0]);
    let n = list.length;
    for(let i = 1; i < n - 1; i++){
        let el = list[i];
        for(let j = 0; j < res.length-2; j++){
            if(el < j+1) swap(res,i,j+1)
        }
    }
    return res;
}

function swap(arr,a,b){
    let temp = arr[a]
    arr[a] = arr[b];
    arr[b] = temp; 
}