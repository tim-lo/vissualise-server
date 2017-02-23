var express = require('express');
var https = require('https');
var router = express.Router();

const CLIENT_ID = "da3d5188a6954fdd74f6";
const CLIENT_SECRET = "45766ce64775b29c7e544f6e1484ffbd57f3c732";

/* Grabs the temporary auth code and gets the access token. */
router.get('/', function(req, res, next) {
  console.log("Code value: " + req.query.code);

  var ACCESS_TOKEN;
  var options = {
    method: 'POST',
    hostname: 'www.github.com',
    path: '/login/oauth/access_token',
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    code: req.query.code,
    accept: 'application/json'
  }

  var gh_req = https.request(options, (gh_res) => {
    console.log('Status code: ' + gh_res.statusCode);
    console.log('Response headers: ' + gh_res.headers);
    gh_res.on('data', (d) => {
      ACCESS_TOKEN = d;
      process.stdout.write(d);
    });
  });

  gh_req.on('error', (e) => {
    console.error(e);
  });

  gh_req.end();

  res.render('index', { title: 'Code value: ' + req.query.code + ' Access token: ' + ACCESS_TOKEN});
});

module.exports = router;