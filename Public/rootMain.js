function $(el){return document.getElementById(el)}

$('klickedJoinServerBtn').oncklick = () =>{
    let address = $('serverIP').value;
    console.log("address",address);
}