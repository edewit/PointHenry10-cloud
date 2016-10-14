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
function joinSession(io, data) {
  io.emit('sessionUpdated', JSON.stringify(data));
}
function createRoute(io) {
  var sessionRoute = new express.Router();
  sessionRoute.use(cors());
  sessionRoute.use(bodyParser());

  sessionRoute.get('/', function (req, res) {
    console.log(new Date(), 'In list session GET / req.query=', req.query);

    res.json(sessions);
  });

  sessionRoute.post('/', function (req, res) {
    console.log(new Date(), 'In hello route POST / req.body=', req.body);

    var session = req.body.session;
    sessions.push(session);
    updateClients(io, session);

    res.json({ msg: 'session added' });
  });

  sessionRoute.post('/join', function (req, res) {
    var foundSession = sessions.filter(function(value) {return value.Name == req.body.session})
    if (!foundSession || foundSession.count == 0) {
      // error
      console.log("ERROR:: session is not here = " + req.body.session);
    } else {
      var foundUser = foundSession[0].Users.filter(function(value) { return value.Name === req.body.user;});
      if (foundUser && !foundUser[0]) {
        foundSession[0].Users.push({Name: req.body.user});
        joinSession(io, {Name: req.body.user});
      }
    }
    res.json(foundSession[0]);
  });

  return sessionRoute;
}

module.exports = createRoute;
