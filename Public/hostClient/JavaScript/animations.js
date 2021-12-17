export async function displayAttack(attackedCard,attackerCard,damage){
    
    let pos = attackedCard.getBoundingClientRect();
    //console.log("atk card",attackedCard,pos)
    


    await new Promise(r => setTimeout(r, 1000));

    let claw = document.createElement('div');
    claw.classList.add('damageClawEffect');
    claw.style.top = pos.top + "px";
    claw.style.left = pos.left - 50 + "px";
    document.body.appendChild(claw);
    let a1 = setInterval(()=>{
     claw.style.top = pos.top + 100 + "px";
     claw.style.left = pos.left + 10 + "px";
     clearInterval(a1)
      let a2 = setInterval(()=>{
       claw.style.opacity = "0";
       clearInterval(a2);
       let a3 = setInterval(()=>{
           clearInterval(a3);
        claw.remove();
       },500)
      },300)
    },10)



    //damage number
    let div = document.createElement('div');
    div.classList.add("damageTextEffect");
    div.style.left = (pos.left) +"px";
    div.style.top = (pos.top) +"px";
    div.innerText = damage;
    document.body.appendChild(div);

    let c1 = setInterval(()=>{
      clearInterval(c1);
      div.style.left = (pos.left -20) +"px";
      div.style.top = (pos.top - 25) +"px";
      div.style.transition = "top 0.2s cubic-bezier(0,0.9,1,1), left 0.2s linear";
      div.style.transfrom = "scale(10)";
      div.style['-webkit-transform'] = "scale(6)";
      
      let c2 = setInterval(()=>{
      clearInterval(c2);
        div.style.transition = '';
        div.style.opacity = "0";
        div.style.left = (pos.left - 25) +"px";
        div.style.top = (pos.top -35) +"px";

        let c3 = setInterval(()=>{
          clearInterval(c3);
          div.remove();

        },500)
      },200)
    },20)
    
    
}