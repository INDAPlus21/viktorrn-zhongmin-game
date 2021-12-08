function $(el){return document.getElementById(el)}

$('hostServer').onclick = () =>{
    window.location.href = './serverClient/';
}

$('joinServerBtn').onclick = () =>{
    let address = $('serverIP').value;
    console.log("address: ",address);
    //validate adress and then send off
    window.location.href = './playerClient/';
}