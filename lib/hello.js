var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
var expressWs = require('express-ws');

var testData = [
        {name: "cool session", createdBy: "Passos"},
        {name: "another session", createdBy: "Erik"}
    ];

function updateClients(data) {
    var ws = expressWs.getWss('/ws');
    ws.clients.forEach(function (client) {
      client.send(data);
    });
}

function createRoute() {
  var sessionRoute = new express.Router();
  sessionRoute.use(cors());
  sessionRoute.use(bodyParser());

  sessionRoute.get('/', function(req, res) {
    console.log(new Date(), 'In list session GET / req.query=', req.query);

    res.json({Sessions: testData});
  });

  sessionRoute.post('/', function(req, res) {
    console.log(new Date(), 'In hello route POST / req.body=', req.body);

    var session = req.body.session;
    testData.push(session);
    updateClients(session);

    res.json({msg: 'session added'});
  });

  sessionRoute.post('/join', function(req, res) {
    updateClients();
  });

  return sessionRoute;
}

module.exports = createRoute;
