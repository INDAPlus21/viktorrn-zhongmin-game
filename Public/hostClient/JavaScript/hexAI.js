export async function takeTurn(playerInfo,boardInfo,turn){

  // playstyle: aggressive (prioritize dealing face damage)
  let actions = [];

  // collect basic data
  let hand = playerInfo.player1.hand;
  let blood = playerInfo.player1.blood;
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
    if (hand[i].name == 'Blood Beast') iDog = i;
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
  }

  let threatCol = [0,1,2,3]; // find threatening cols
  for (let i of [0,1,2,3]) {
    if (safeCol.indexOf(i) !== -1) threatCol.splice(i,1); // if its a safe col then its not a threat col
  }
  
  let myCol = []; // find my available cols for play
  let dogCount = 0;
  for (let i of [0,1,2,3]) {
    if (myBoard[i] === null) myCol.push(i);
    else {
      try {
        if (enemyBoard[i].name === "Blood Hound") dogCount++;
      } catch {/* dude idk nothing */}
    }
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
    actions.push( {action : 'playCard' , cardIndex : iCad+"", column: 0 } );
    actions.push( {action : 'sacrifice' , column: 0 } );
    actions.push( {action : 'sacrifice' , column: 0 } );
    actions.push( {action : 'playCard' , cardIndex : iHound+"", column: 3 } );
  }
  if (turn == 2 || turn == 3) {
    actions.push( {action : 'playCard' , cardIndex : iH+"", column: myCol[0] } );
    actions.push( {action : 'sacrifice' , column: myCol[0] } );
    if (iDog !== -1) actions.push( {action : 'playCard' , cardIndex : iDog+"", column: myCol[0] } ); // if there is dog
  }
  if (turn > 3) { // start checking if there are enough dogs for a cannon
    actions.push( {action : 'playCard' , cardIndex : iH+"", column: myCol[0] } );
    actions.push( {action : 'sacrifice' , column: myCol[0] } );
    if ((blood > 2 || blood + dogCount > 2) && iCannon !== -1 && safeCol.length > 0) { // if enough blood, and cannon is in hand, and there is a safe space for it
      if (myCol.indexOf(safeCol[0]) === -1) actions.push( {action : 'sacrifice' , column: safeCol[0] } ); // if occupied, get rid of card
      actions.push( {action : 'playCard' , cardIndex : iDog+"", column: safeCol[0] } );
    }
    if (iDog !== -1 && blood > 0) {  // if there is dog and it can be played
      actions.push( {action : 'playCard' , cardIndex : iDog+"", column: myCol[0] } );
    }
  }
  return actions;
}