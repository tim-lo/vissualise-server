var express = require('express');
var https = require('https');
var mongoose = require('mongoose');
var router = express.Router();

const CLIENT_ID = "da3d5188a6954fdd74f6";
const CLIENT_SECRET = "45766ce64775b29c7e544f6e1484ffbd57f3c732";

/* Grabs the temporary auth code and gets the access token. */
router.get('/', function(req, res, next) {
  mongoose.connect('mongodb://thomas.li@ds157829.mlab.com:57829/heroku_d91pg99g');
  var db = mongoose.connection;
  db.on('error', console.error.bind(console, 'connection error:'));
  db.once('open', function() {
    console.log("MongoDB connected!");
  });

  console.log("Code value: " + req.query.code);

  var ACCESS_TOKEN;
  var options = {
    method: 'POST',
    hostname: 'github.com',
    path: '/login/oauth/access_token?client_id=' + CLIENT_ID + '&client_secret=' + CLIENT_SECRET + '&code=' + req.query.code,
    headers: {
      'Accept': 'application/json'
    }
  }

  var gh_req = https.request(options, (gh_res) => {
    console.log('Response: ' + gh_res);
    console.log('Status code: ' + gh_res.statusCode);
    console.log('Response headers: ' + JSON.stringify(gh_res.headers));
    gh_res.on('data', (d) => {
      ACCESS_TOKEN = JSON.parse(d.toString());
      console.log('Payload: ', d.toString());
      res.render('index', { title: 'Code value: ' + req.query.code + ' Access token: ' + ACCESS_TOKEN["access_token"]});
    });
  });

  gh_req.on('error', (e) => {
    console.error(e);
  });

  gh_req.end();
});

module.exports = router;