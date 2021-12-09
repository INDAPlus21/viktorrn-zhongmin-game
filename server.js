// the file to run from node
const express = require('express') // create module
let app = express(); // create an express object
const http = require('http').Server(app);

app.use(express.static(__dirname + '/Public')); 

http.listen(5000, function(){ // set port
    console.log('listening on *:5000');
  });