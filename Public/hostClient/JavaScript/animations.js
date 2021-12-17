export async function displayAttack(attackerCard,attackedCard,damage,playerIndex){
    
    let dir;
    if(playerIndex == 1) dir = 1;
    else dir = -1;

    //console.log("atk card",attackedCard,pos)
    let pos2 = attackerCard.getBoundingClientRect();
    let dispCard = attackerCard.cloneNode(true);

    attackerCard.style.visibility = 'hidden';
    dispCard.classList.add('highlightCard');
    dispCard.style.left = pos2.left+"px";
    dispCard.style.top = pos2.top+"px";
    dispCard.style.transition = "top 0.3s cubic-bezier(0,3,.6,1), transform 0.3s cubic-bezier(0,2,.5,1)"
    document.body.appendChild(dispCard);

    let a1 = setInterval(()=>{
        clearInterval(a1)
        dispCard.style.transform = "scale(1.2)";
        let a2 = setInterval(()=>{
            clearInterval(a2);
            dispCard.style.top = pos2.top+ dir*50 +"px";
            let a3 = setInterval(()=>{
                clearInterval(a3);
                dispCard.style.top = pos2.top+"px";
                dispCard.style.transition = "top 0.3s cubic-bezier(0.5,.95,.8,1), transform 0.2s cubic-bezier(0,1,.5,1)";
                let a4 = setInterval(()=>{
                    clearInterval(a4);
                    dispCard.style.transform = '';
                    let a5 = setInterval(()=>{
                        clearInterval(a5);
                        dispCard.remove();
                        attackerCard.style.visibility = '';
                    },200)
                },500)
            },270)
        },500)
    },10)
    

    await new Promise(r => setTimeout(r, 700));

    let claw = document.createElement('div');
    claw.classList.add('damageClawEffect');
    claw.style.top = pos.top + "px";
    claw.style.left = pos.left - 50 + "px";
    document.body.appendChild(claw);
    let b1 = setInterval(()=>{
     claw.style.top = pos.top + 20 + "px";
     claw.style.left = pos.left + 10 + "px";
     clearInterval(b1)
      let b2 = setInterval(()=>{
       claw.style.opacity = "0";
       clearInterval(b2);
       let b3 = setInterval(()=>{
           clearInterval(b3);
        claw.remove();
       },500)
      },300)
    },10)

    //damage number
    let pos = attackedCard.getBoundingClientRect();

    let div = document.createElement('div');
    div.classList.add("damageTextEffect");
    div.style.left = (pos.left) +"px";
    div.style.top = (pos.top) +"px";
    div.innerText = damage;
    document.body.appendChild(div);

    let c1 = setInterval(()=>{
      clearInterval(c1);
      div.style.left = (pos.left -20) +"px";
      div.style.top = (pos.top +dir*25) +"px";
      div.style.transition = "top 0.2s cubic-bezier(0,0.9,1,1), left 0.2s linear";
      div.style.transfrom = "scale(10)";
      div.style['-webkit-transform'] = "scale(6)";
      
      let c2 = setInterval(()=>{
      clearInterval(c2);
        div.style.transition = '';
        div.style.opacity = "0";
        div.style.left = (pos.left - 40) +"px";
        div.style.top = (pos.top +dir*35) +"px";

        let c3 = setInterval(()=>{
          clearInterval(c3);
          div.remove();

        },500)
      },200)
    },20)
    
    
}