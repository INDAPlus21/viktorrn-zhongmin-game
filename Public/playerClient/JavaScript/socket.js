function $(el) { return document.getElementById(el) };

let socket = io(); // event listener/emitter
let roomId; // room id
let playerName;
let socketId;

socket.on('connect', () => {// run this when connected
    socketId = socket.id; // save this
    console.log("I'm online! with id " + socketId);
});

joinServer = function () {
    roomId = $('serverIP').value;
    playerName = $('loginPlayerName').value;

    socket.emit('joinRoom', roomId, playerName, socketId, (verdict, reason) => {
        if (verdict==='fail') $('loginErrorText').innerHTML = reason;
        else {
            $('login').classList.remove('onscreen');
            $('selectstartercards').classList.add('onscreen');
        }
    });
}