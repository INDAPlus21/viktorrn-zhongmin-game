
export async function takeTurn(playerInfo,boardInfo,turn){
    /*
        Behaviour milestones:
        
        Score cards in hand [X]

        Fix if should pull human or beast
        
        Value faceAttacking
        
        Human Block

        Check if next card in line solves issue
        
        Evaluate if should sacc own cards

        ---> Make A function that compares cards at will, for quicker debug <---

    */
    let actions = [];
    
    drawOneCard(playerInfo.player1);

    let hand = playerInfo.player1.hand;
    let blood = playerInfo.player1.blood += 1;
    let deck = playerInfo.player1.remainingDeck;
    let yourBoard = boardInfo.player1;
    let enemyBoard = boardInfo.player2;

    
    //score cards against players 
    
    let treathMap = calcThreatBoard(enemyBoard,yourBoard);
    
    let interactions = [];
    for(let c in hand){
        if(hand[c].name == "Human") continue;
        for(let oc of treathMap){
            if(oc.score == 0) continue;
            let score = compareCards(hand[c] , enemyBoard[ oc.col ])
            interactions.push({card : hand[c], cardIndex : c ,score: score , col: oc.col , oc : enemyBoard[ oc.col ] })
        }
    }

    sortItems(interactions);
    //remove duplicate actions
    let foundIndexes = []
    for(let i = interactions.length-1; i >= 0; i--){
        let foundAny = false;
        for(let c of foundIndexes){
            if(interactions[i].cardIndex == c){
                interactions.splice(i,1);
                foundAny = true;
                break;
            }
        }
        if(!foundAny) {
            foundIndexes.push(interactions[i].cardIndex)
        }
    }
    

    //clear card dupes
    

    console.log("threat map post sort",treathMap);
    console.log("action map", interactions);

    for(let c in hand){
        if(hand[c].name == "Human"){
            blood++;
            hand.splice(c,1);
        }
    }
    console.log("blood",blood)
    
    
    /*if(resourcesAmount < findCheapestCard(hand)){
        humanCards += 1;
    }*/

    
    if(interactions.length == 0) return [];
    if(blood >= interactions[interactions.length-1].card.cost){
        actions.push( {action : "playCard" , cardIndex : Number(interactions[interactions.length-1].cardIndex), column: interactions[interactions.length-1].col  } )
    }
    
    console.log("actions",actions);
    return actions;
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
        let enemyCard = enemyBoard[r];
        let score = 1 + enemyCard.damage + enemyCard.health/2;
        threatMap.push( {score :  score , col : Number(r)} )
    }
    return sortItems(threatMap);
}

export function compareCardsOld(yourCard,opposingCard){
    let yourDamage = yourCard.damage;
    let yourHealth = yourCard.health;
    let opposingDamage = opposingCard.damage;
    let opposingHealth = opposingCard.health;
    
    //goal: Figure out if I win of lose this duel

    let damageTimes = 1;
    for(let a of yourCard.amulets){
        switch(a){
            case 'Rush':
                damageTimes = 0;
            break;
        }
    }

    let remainingHP =  yourHealth - opposingDamage * damageTimes;
    let turnsToDie;
    
    if(remainingHP > 0) turnsToDie = opposingDamage != 0 ? remainingHP / opposingDamage : 0 ;
    else turnsToDie = 3*opposingDamage;

    let turnsToKill = yourDamage != 0 ? 1.5/ (opposingHealth / yourDamage)  : 0 ;

    let score = turnsToKill - turnsToDie;

    console.log("remaining HP",remainingHP)
    console.log("score",score)
    console.log("ttk",turnsToKill,"ttd",turnsToDie)

    return score;
}

export function compareCards(yourCard,opposingCard){
     
    /*
        The cost factor:

        opposing card:      scale: K (cost - oc.cost + 1) (cost + oc.cost - 1) - C*cost 
                                    K used to lower value difference
                                    C used to favor cheaper cards

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

    let damageTimes = 1;
    let yourDamage = yourCard.damage;
    let yourHealth = yourCard.health;
    let opposingDamage = opposingCard.damage;
    let opposingHealth = opposingCard.health;
    let midPoint = opposingCard.cost;
    let point = yourCard.cost;

    let canHitFlying = false;
    let enemyCardFlying = false;
    let yourCardFlying = false;
    let yourCardHasRush = false;

    for(let a of opposingCard.amulets){
        switch(a){
            case 'Flying':
                enemyCardFlying = true;
                break;
        }
    }

    for(let a of yourCard.amulets){
        switch(a){
            case 'Rush':
                damageTimes = 0;
                yourCardHasRush = true;
            break;
            case 'Flying':
                yourCardFlying = true;
            case 'Reach':
                canHitFlying = true;
                break;
        }
    }

  
    if( yourCardFlying != enemyCardFlying){ yourDamage = 0; opposingDamage = 0; } 
    if( enemyCardFlying && canHitFlying){ yourDamage = yourCard.damage }

    let costScore = 1 - 0.2*(point - midPoint) * (point - midPoint) - 0.25*point;
    
    let remainingHP =  yourHealth - opposingDamage * damageTimes;
    let turnsToDie;
    if(remainingHP > 0) turnsToDie = opposingDamage != 0 ? remainingHP / opposingDamage : 0 ;
    else turnsToDie = opposingDamage;

    let turnsToKill = yourDamage != 0 ? 1 / (opposingHealth / yourDamage)  : 0 ;
                                            
    let opportunity = 0;
    if(enemyCardFlying && !yourCardFlying){
        if(canHitFlying) opportunity += 0.25 * turnsToKill;
        else opportunity += 0.2*yourCard.damage;
    } 
    if(yourCardHasRush && yourDamage === opposingHealth) {
        //console.log("instakill rush")
        opportunity += 0.25; 
    }

    
    let score = 0.25 * Math.fround(turnsToKill - turnsToDie) + costScore + opportunity;

    /*console.log("card",yourCard,"opposingCard",opposingCard)
    console.log("costScore",costScore)
    console.log("opportunity",opportunity)
    console.log("ttk - ttd",turnsToKill," - ",turnsToDie," = ",0.25*(turnsToKill - turnsToDie))
    console.log("Final score",score)*/

    return score; 
}

function drawOneCard(playerObj) {
    if (playerObj.remainingDeck.length > 0)
    playerObj.hand.push(playerObj.remainingDeck.shift());
    // shift() takes one element from the array and pushes it into the player's hand
  }


export function sortItems(list) {
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