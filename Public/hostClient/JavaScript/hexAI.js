export async function takeTurn(playerInfo,boardInfo,turn){

  // playstyle: aggressive (prioritize dealing face damage)
  let actions = [];

  // collect basic data
  let hand = playerInfo.player1.hand;
  let blood = playerInfo.player1.blood += 1; // assume a vessel card is always drawn and sacrificed
  let deck = playerInfo.player1.remainingDeck;
  let myBoard = boardInfo.player1;
  let enemyBoard = boardInfo.player2;

  drawOneCard(playerInfo.player1);

  let iCad, iCannon, iHound, iSparrow = -1;

  for (let i=0; i++; i<hand.length) {
    if (hand[i].name == 'Cadaver') iCad = i;
    if (hand[i].name == 'Cannon') iCannon = i;
    if (hand[i].name == 'Hound Master') iHound = i;
    if (hand[i].name == 'Sparrow') iSparrow = i;
    if (hand[i].name == 'Human') iH = i;
  }

  let safeCol = [];
  for (let i of [0,1,2,3]) { // find safe cols
    if (enemyBoard[i] === null) safeCol.push(i);
    else {
      try {
        if (enemyBoard[i].amulets.includes("Flying")) safeCol.push(i);
      } catch {/* dude idk nothing */}
    }
    break;
  }

  let threatCol = [0,1,2,3]; // find threatening cols
  for (let i of [0,1,2,3]) {
    if (safeCol.indexOf(i) !== -1) threatCol.splice(i,1); // if its a safe col then its not a threat col
  }
  
  let myCol = [];
  for (let i of [0,1,2,3]) { // find my available cols for play
    if (myBoard[i] === null) myCol.push(i);
  }
  
  // DAVEY JONES' SAIL PLAN
  // ONE: BRING ON AN' SACRIFICE ME MATEY.
  // TWO: BRING ON ME CADAVERS AN' SACRIFICE IT TOO. NOW I HAVE TWO BLOOD.
  // THREE: I SUMMON ME HOUND MASTER AND SET 'IM ON AN EMPTY DIRECTION.
  // FOUR: I SUMMON ME MATEYS AND SACRIFICE THEM FOR ME SCALLYHOUNDS. ALSO SACRIFICE ME OTHER CADAVER.
  // FIVE: AS SOON AS I CAN HAVE THREE BLOOD FROM ME BOOTY, ME MATEYS AN' ME HOUNDS, SACRIFICE THEM ALL FOR A CANNON.

  if (turn <= 1) {
    actions.push( {action : 'playCard' , cardIndex : iH+"", column: 0 } );
    actions.push( {action : 'sacrifice' , column: 0 } );
    actions.push( {action : 'playCard' , cardIndex : iCad+"", column: 0 } );
    actions.push( {action : 'sacrifice' , column: 0 } );
    actions.push( {action : 'sacrifice' , column: 0 } );
    actions.push( {action : 'playCard' , cardIndex : iHound+"", column: myCol[0] } );
  }

  return actions;
}