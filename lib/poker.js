var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');

var sessions = [
  { Name: "Session to play", CreatedBy: { Name: "Passos" }, Users: [{ Name: "Erik" }, { Name: "Corinne" }]},
  { Name: "Cool", CreatedBy: { Name: "Erik" }, Users: [{ Name: "Julio" }, { Name: "Passos" }] }
];

function updateClients(io, data) {
  console.log('Emit new session:' + data.Name + ' created by:' + data.CreatedBy.Name);
  io.emit('sessions', JSON.stringify(data));
}

function updateUserForSession(io, data) {
  console.log('Emit session updated (user: ' + data.user.Name + ' join the session:'+ data.session+')');
  io.to(data.session).emit('sessionUpdated', JSON.stringify(data.user));
}

function updateVoteForSession(io, data) {
  io.to(data.session).emit('voteUpdated', JSON.stringify(data.user));
}

function createRoute(io) {
  var sessionRoute = new express.Router();
  sessionRoute.use(cors());
  sessionRoute.use(bodyParser());

  io.on('connection', function(socket) {
    socket.on('room-join', function(room){
      console.log('Received notififation room-join for session:', room);
      if (socket.lastRoom) {
        socket.leave(socket.lastRoom);
      }
      socket.join(room);
      socket.lastRoom = room;
    });

    socket.on('showVotes', function(sessionName) {
      console.log('client wants to show votes for', sessionName);
      io.to(sessionName).emit('finish', 'showVotes')
    });
  });

  sessionRoute.get('/', function (req, res) {
    res.json(sessions);
  });

  sessionRoute.post('/', function (req, res) {
    console.log('Create session ', req.body);

    var session = req.body;
    sessions.push(session);
    updateClients(io, session);

    res.json({ msg: 'session added' });
  });

  function findByName(name, array) {
    return array.filter(function(value) { return value.Name === name});
  }

  function findUserAndSession(sessionName, userName) {
    var foundSession = findByName(sessionName, sessions);
    if (!foundSession || !foundSession[0]) {
      return {};
    } else {
      var foundUser = findByName(userName, foundSession[0].Users);
      if (!foundUser || !foundUser[0]) {
        return { session: foundSession[0] };
      } else {
        return { user: foundUser[0], session: foundSession[0] };
      }
    }
  }

  sessionRoute.post('/join', function (req, res) {
    var found = findUserAndSession(req.body.session, req.body.user);
    if (found.session) {
      if (!found.user) {
        found.session.Users.push({Name: req.body.user});
      }
      updateUserForSession(io, {session: found.session.Name, user: { Name: req.body.user}});
    }

    res.json(found.session);
  });

  sessionRoute.post('/vote', function (req, res) {
    var found = findUserAndSession(req.body.session, req.body.user.Name);;

    if (!found.user || !found.session) {
      res.json({ err: 'session or user not found'});
      return;
    }

    found.user.Vote = req.body.user.Vote;
    updateVoteForSession(io, {session: found.session.Name, user: found.user});
    res.json(found.session)
  });

  return sessionRoute;
}

module.exports = createRoute;
