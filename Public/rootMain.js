function $(el){return document.getElementById(el)}

$('hostServer').onclick = () =>{
    window.location.href = './hostClient/';
}

$('joinServerBtn').onclick = () =>{
    //validate adress and then send off
    window.location.href = './playerClient/';
}