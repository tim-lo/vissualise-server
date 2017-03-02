var express = require('express')
  , https = require('https')
  , mongo = require('mongodb').MongoClient
  , assert = require('assert');

var router = express.Router();

const CLIENT_ID = "da3d5188a6954fdd74f6";
const CLIENT_SECRET = "45766ce64775b29c7e544f6e1484ffbd57f3c732";

//Return JSON format: {"access_token":"ACCESS_TOKEN","token_type":"bearer","scope":"repo,user:email"}

/* Grabs the temporary auth code and gets the access token. */
router.get('/', function(req, res, next) {
  mongo.connect('mongodb://vissualise:vissualise@ds157829.mlab.com:57829/heroku_d91pg99g', (err, db) => {
    assert.equal(null, err);
    console.log("MongoDB connection successful!");
    db.close();
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