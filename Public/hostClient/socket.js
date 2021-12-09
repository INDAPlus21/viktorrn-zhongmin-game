let socket = io(); // event listener/emitter

let roomId; // room id

socket.on("connect", () => {// run upon connection
  console.log("I'm online! with id " + socket.id);

  // this is only run once, when the host client connects
  socket.emit("createRoom", socket.id, (generated) => {
    roomId = generated;
    console.log(roomId);
    socket.join(roomId);
  });
});