var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');

var testData = [
  { Name: "session to play", CreatedBy: { Name: "Passos" } },
  { Name: "cool", CreatedBy: { Name: "Erik" } }
];

function updateClients(ws, data) {
  ws.clients.forEach(function (client) {
    client.send(JSON.stringify(data));
  });
}

function createRoute(expressWs) {
  var sessionRoute = new express.Router();
  sessionRoute.use(cors());
  sessionRoute.use(bodyParser());

  sessionRoute.get('/', function (req, res) {
    console.log(new Date(), 'In list session GET / req.query=', req.query);

    res.json({ Sessions: testData });
  });

  sessionRoute.post('/', function (req, res) {
    console.log(new Date(), 'In hello route POST / req.body=', req.body);

    var session = req.body.session;
    testData.push(session);
    updateClients(expressWs, session);

    res.json({ msg: 'session added' });
  });

  sessionRoute.post('/join', function (req, res) {
    updateClients(expressWs);
  });

  return sessionRoute;
}

module.exports = createRoute;
