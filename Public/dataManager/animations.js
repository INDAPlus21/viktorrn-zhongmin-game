function $(el){return document.getElementById(el)}

export async function chatMessage(senderIndex,text){
    let dir = senderIndex == 1 ? 1 : -1;
    let textLength = text.length;
    let length = text.length >= 55 ? 1 : text.length / 55;
    let textOffset = length * 200;
    let ogPos = $('player'+senderIndex+'Name').getBoundingClientRect();
    let ogY = dir == 1 ? ogPos.top + 30 : ogPos.top - 30 - 30 * Math.ceil(text.length / 55);
    
    let ang = Math.PI -Math.PI/8 * Math.floor(Math.random()*7) 
    let dist = 120;
    let dvec = {x:dir*Math.cos(ang),y:dir*Math.sin(ang)};

    let msg = document.createElement('div');
    msg.innerText = '"'+text+'"';
    msg.classList.add('chatMessage');
    msg.style.top = ogY + 'px';
    msg.style.left = (ogPos.left - textOffset) +'px';
    msg.style.transform = "scale(0.1)";
    msg.style.transition = "0.15s transform cubic-bezier(0.5,.1,.3,1.5),opacity 0.5s linear, top 7s linear, left 7s linear";
    msg.style['-webkit-transform'] = "0.15s transform cubic-bezier(0.5,.1,.3,1.5), opacity 0.5s linear, top 7s linear, left 7s linear";
  
    document.body.appendChild(msg);

    let a1 = setInterval(()=>{
        clearInterval(a1);
        msg.style.transform = "scale(1)"
        msg.style.top = ogY + dvec.y*dist + "px";
        msg.style.left = (ogPos.left - textOffset) + dvec.x*dist + "px";
        let a2 = setInterval(()=>{
            clearInterval(a2)
            msg.style.opacity = '0';
            let a3 = setInterval(()=>{
                clearInterval(a3)
                msg.remove();
            },500)
        }, 1000/17 *textLength)
       
    },10)

}

export async function displayAttack(attackingCard,attackedCard,attackedCardData,damage,playerIndex,strikingCard){
    let dir = playerIndex == 1 ? 1 : -1;

    try{
        let pos2 = attackingCard.getBoundingClientRect();
        let dispCard = attackingCard.cloneNode(true);
    
        attackingCard.style.visibility = 'hidden';
        dispCard.classList.add('highlightCard');
        dispCard.style.left = pos2.left+"px";
        dispCard.style.top = pos2.top+"px";
        dispCard.style.zIndex = "4";
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
                            attackingCard.style.visibility = '';
                        },200)
                    },500)
                },270)
            },500)
        },10)
    }catch{}
    
    
    await new Promise(r => setTimeout(r, 700));

    try{
        let pos = attackedCard.getBoundingClientRect();
        // claw effect
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
    
        // damage
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
        div.style.transfrom = "scale(6)";
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


        if(strikingCard == false) return;
        
        let dispCard2 = attackedCard.cloneNode(true);
        dispCard2.classList.add('highlightCard');
        
        

        // card that moves upon being hit
        
        dispCard2.style.left = pos.left+"px";
        dispCard2.style.top = pos.top+"px";
        dispCard2.style.transition = "top 0.3s cubic-bezier(0,1,.25,2), left 0.3s cubic-bezier(0,1,.25,1.5)";
        dispCard2.style.zIndex = "3";
        document.body.appendChild(dispCard2);
        attackedCard.style.visibility = 'hidden';

        let d1 = setInterval(()=>{
            clearInterval(d1);
            dispCard2.style.left = pos.left+ dir*20 + "px";
            dispCard2.style.top = pos.top + dir*20 + "px";
            if(attackedCardData != null){
                dispCard2.children[6].innerText = attackedCardData.health;
                attackedCard.children[6].innerText = attackedCardData.health;
            } 
            let d2 = setInterval(()=>{
                clearInterval(d2);
                dispCard2.style.left = pos.left + "px";
                dispCard2.style.top = pos.top + "px";
                let d3 = setInterval(()=>{
                    clearInterval(d3);
                    dispCard2.remove();
                    attackedCard.style.visibility = '';
                    
                },300)
            },300)
        },10)

    }catch{}
    
}

export async function cardServerSidePlayed(){

}

export async function cardServerSideSacrificed(){

}

export async function sacrificeCard(cardDOM){
    let pos = cardDOM.getBoundingClientRect();
    let clone = cardDOM.cloneNode(true);
    clone.style.position = "absolute";
    clone.style.top = pos.top +"px";
    clone.style.left = pos.left +"px";
    document.body.appendChild(clone);
    let sacItem = clone.lastChild;
    let dagger = clone.lastChild.firstChild;
    sacItem.style.opacity = 1;
    clone.style.transition = "top 0.1s cubic-bezier(0,0,.7,2), opacity 0.2s linear";
    dagger.style.transition = " top 0.15s cubic-bezier(.2,0,0,1.9) ";
    
    await new Promise(r => setTimeout(r, 10));
    dagger.style.top = '-80px';
    
    await new Promise(r => setTimeout(r, 200));
    dagger.style.transition = " top 0.1s cubic-bezier(1,0,.7,1.6) ";
    dagger.style.top = '20px';
    
    await new Promise(r => setTimeout(r, 50));
    clone.style.top = pos.top + 10 + "px";
    
    await new Promise(r => setTimeout(r, 50));
    let blood = document.createElement('div');
    blood.style.top = pos.top + 100 + "px";
    blood.style.left = pos.left + 40 + "px"; 
    blood.classList.add('freeBlood');
    document.body.appendChild(blood);
    blood.style.transition = " top 0.3s cubic-bezier(0,.55,.55,1),transform 0.3s cubic-bezier(0,.55,.55,1)";
    
    await new Promise(r => setTimeout(r, 10));
    blood.style.top = pos.top + 230 + "px";
    //let extra = -15 + Math.floor(Math.random()*30);
    //blood.style.transform = "rotate(" + (60+extra) + "deg)";
    
    await new Promise(r => setTimeout(r, 50));
    clone.style.top = pos.top + "px";
    dagger.style.top = '0px';
    clone.style.opacity = 0;
    
    await new Promise(r => setTimeout(r, 190));
    clone.remove();
    await new Promise(r => setTimeout(r, 120));
    blood.style.transition = " top 0.3s cubic-bezier(.69,0,.94,.77),left 0.3s cubic-bezier(.69,0,.94,.77),opacity 0.2s linear";
    let pos2 = $('bloodLevel').getBoundingClientRect();
    blood.style.left = pos2.left +"px";
    blood.style.top = pos2.top +"px";
    await new Promise(r => setTimeout(r, 200));
    blood.style.opacity = 0;
    await new Promise(r => setTimeout(r, 200));
    blood.remove();

    return true;
}

export async function cardClientSideSacrificed(){

}

export async function backgroundTextClientSide(textType,text){
    let msg = text;
    switch(textType){
        default:
            document.getElementById('backgroundTextText').innerHTML = msg;
            break;
    }
}

export async function clientSidePopUpPrompt(type,text){
    await new Promise(r => setTimeout(r, 200));
    // Full height, including the scroll part
    const fullHeight = Math.max(
        document.body.scrollHeight,
        document.documentElement.scrollHeight,
        document.body.offsetHeight,
        document.documentElement.offsetHeight,
        document.body.clientHeight,
        document.documentElement.clientHeight
    );
    const fullWidth = Math.max(
        document.body.scrollWidth,
        document.documentElement.scrollWidth,
        document.body.offsetWidth,
        document.documentElement.offsetWidth,
        document.body.clientWidth,
        document.documentElement.clientWidth
    );
    let ogPos = {top:fullHeight/2,left:fullWidth/2}
    let msg = document.createElement('div');
    msg.innerText = text;
    msg.classList.add('textPopUp');
    msg.style.top = ogPos.top - 150 + 'px';
    msg.style.left = ogPos.left -120 +'px';
    msg.style.transform = "scale(0.1)";
    msg.style.transition = "0.15s transform cubic-bezier(0.5,.1,.3,1.5),opacity 0.5s linear, top 7s linear, left 7s linear";
    msg.style['-webkit-transform'] = "0.15s transform cubic-bezier(0.5,.1,.3,1.5), opacity 0.5s linear, top 7s linear, left 7s linear";
  
    document.body.appendChild(msg);

    let a1 = setInterval(()=>{
        clearInterval(a1);
        msg.style.transform = "scale(1)"
        msg.style.top = ogPos.top + 50 + "px";
        msg.style.left = (ogPos.left - 140) + "px";
        let a2 = setInterval(()=>{
            clearInterval(a2)
            msg.style.opacity = '0';
            let a3 = setInterval(()=>{
                clearInterval(a3)
                msg.remove();
            },500)
        }, 300)
       
    },10)

}