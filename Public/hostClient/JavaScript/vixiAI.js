

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
    
    let interactions = [];
    for(let c in hand){
        for(let oc of treathMap){
            if(oc.score == 0) continue;
            let score = compareCards(hand[c] , enemyBoard[ oc.col ])
            interactions.push({card : hand[c], score: score , col: oc.col , oc : enemyBoard[ oc.col ] })
        }
    }
    sortItems(interactions);
    console.log("threat map post sort",treathMap);
    console.log("action map", interactions)
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
        if(enemyBoard[r] == null){
            threatMap.push({score : 0 , col : Number(r)})
            continue;
        }
        console.log()
        let enemyCard = enemyBoard[r];
        let score = 1 + enemyCard.damage + enemyCard.health/2;
        threatMap.push( {score :  score , col : Number(r)} )
    }
    return sortItems(threatMap);
}

function compareCards(yourCard,opposingCard){
    
    let score = 0;
    let damageTimes = 1;
    let midPoint = opposingCard.cost;
    let point = yourCard.cost;

    /*
        MidPoint: 1
        EQ:         - (x - 0,5)( x + 1,5)
                        X: 0,5 = 0  
                        X: - 1,5 = 0
    */

    for(let a of yourCard.amulets){
        switch(a){
            case 'rush':
                damageTimes = 0;
            break;
        }
    }

    let costScore = 1 - 0.2*(point - midPoint) * (point - midPoint) - 0.1*point
    console.log("card",yourCard,"opposingCard",opposingCard,"score",costScore)
    
    let remainingHP = yourCard.health - opposingCard.damage * damageTimes;
    let turnsToDie;
    if(remainingHP > 0)
    turnsToDie = opposingCard.damage != 0 ? remainingHP / opposingCard.damage 
                                            : 0 ;
    else turnsToDie = opposingCard.damage;

    let turnsToKill = yourCard.damage != 0 ? 1 / (opposingCard.health / yourCard.damage) 
                                            : 0 ; 


    
    
    /*
        The cost factor:

        opposing card:      scale: (cost - oc.cost + 1) (cost + oc.cost - 1) 


        Def: efficiantly, cheapest card that wins 

        case : playing 2/2 into 1/1 
        goal: play a card that kills as efficiantly as possible

        after played 1/1 -> 2/2 -> your turn 2/1 -> 1/1

        ttk: 1 / 2 = 0.5 turn -> 1 / 0.5 -> 2 score
        ttd: 1 / 1 = 1 turn -> 1 -> 1 score

        calc = ttk - ttd -> 2 - 1 = 1

        case : playing into 0/1
        goal: kill with cheapest card

        ttd: H / 0 doesnt work
        ttd: 1/ ( D / cost )
        ttk: 1/ ( 1 / D)

        best kill card cost vs damage
        

    */

    let result = (turnsToKill - turnsToDie) + costScore;
    score = result;
    
    return result; 
}

function drawOneCard(playerObj) {
    if (playerObj.remainingDeck.length > 0)
    playerObj.hand.push(playerObj.remainingDeck.shift());
    // shift() takes one element from the array and pushes it into the player's hand
  }


function sortItems(list) {
	let swapped = true;
	do {
		swapped = false;
		for (let j = 0; j < list.length-1; j++) {
			if (list[j].score > list[j + 1].score) {
				swap(list,j,j+1)
				swapped = true;
			}
		}
	} while (swapped);
	return list;
}

function swap(arr,a,b){
    let temp = arr[a]
    arr[a] = arr[b];
    arr[b] = temp; 
}