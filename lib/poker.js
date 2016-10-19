var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');

var sessions = [
  { Name: "session to play", CreatedBy: { Name: "Passos" }, Users: [{ Name: "Erik" }, { Name: "Corinne" }]},
  { Name: "cool", CreatedBy: { Name: "Erik" }, Users: [{ Name: "Julio" }, { Name: "Passos" }] }
];

function updateClients(io, data) {
  io.emit('sessions', JSON.stringify(data));
}
function updateUserForSession(io, data) {
  console.log('emit session update to', data.session);
  io.to(data.session).emit('sessionUpdated', JSON.stringify(data.user));
}
function createRoute(io) {
  var sessionRoute = new express.Router();
  sessionRoute.use(cors());
  sessionRoute.use(bodyParser());

  io.on('connection', function(socket) {
    socket.on('room-join', function(room){
      console.log('client wants to join room', room);
      if (socket.lastRoom) {
        socket.leave(socket.lastRoom);
      }
      socket.join(room);
      socket.lastRoom = room;
    });
  });

  sessionRoute.get('/', function (req, res) {
    console.log('List sessions');
    res.json(sessions);
  });

  sessionRoute.post('/', function (req, res) {
    console.log('Create session ', req.body);

    var session = req.body;
    sessions.push(session);
    updateClients(io, session);

    res.json({ msg: 'session added' });
  });

  sessionRoute.post('/join', function (req, res) {
    var foundSession = sessions.filter(function(value) {return value.Name === req.body.session});
    if (!foundSession || !foundSession[0]) {
      console.log("ERROR:: session is not here = " + req.body.session);
    } else {
      var foundUser = foundSession[0].Users.filter(function(value) { return value.Name === req.body.user;});
      if (foundUser && !foundUser[0]) {
        foundSession[0].Users.push({Name: req.body.user});
      }
      updateUserForSession(io, {session: foundSession[0].Name, user: { Name: req.body.user}});
    }
    res.json(foundSession[0]);
  });

  sessionRoute.post('/vote', function (req, res) {
    var foundSession = sessions.filter(function(value) {return value.Name === req.body.session});
    if (!foundSession || !foundSession[0]) {
      console.log("ERROR:: session is not here = " + req.body.session);
      return;
    }

    var foundUser = foundSession[0].Users.filter(function(value) { return value.Name === req.body.user.Name});
    if (!foundUser || !foundUser[0]) {
      console.log("ERROR:: user has not joined = " + req.body.user.Name);
      return;
    }

    foundUser[0].Vote = req.body.user.Vote;
    updateUserForSession(io, {session: foundSession[0].Name, user: foundUser[0]});
    res.json(foundSession[0])
  });

  return sessionRoute;
}

module.exports = createRoute;
