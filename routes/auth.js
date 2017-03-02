var express = require('express')
  , https = require('https');

var router = express.Router();

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;


/* Grabs the temporary auth code and gets the access token. */
router.get('/', function(req, res, next) {
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
      /* Return JSON format: {"access_token":"ACCESS_TOKEN","token_type":"bearer","scope":"repo,user:email"} */
      ACCESS_TOKEN = JSON.parse(d.toString());
      //console.log('Payload: ', d.toString());
      console.log('User repos: ' + getUserRepos());
      res.render('graph', { title: 'Code value: ' + req.query.code + ' Access token: ' + ACCESS_TOKEN["access_token"]});
    });
  });

  gh_req.on('error', (e) => {
    res.locals.message = e.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    res.status(err.status || 500);
    res.render('error');
    console.error(e);
  });

  gh_req.end();
});

function getUserRepos() {
  var options = {
    method: 'GET',
    hostname: 'github.com',
    path: '/user',
    headers: {
      'Accept': 'application/json'
    }
  }
  var gh_req = https.request(options, (gh_res) => {
    console.log('Response: ' + gh_res);
    console.log('Status code: ' + gh_res.statusCode);
    console.log('Response headers: ' + JSON.stringify(gh_res.headers));
    gh_res.on('data', (d) => {
      return JSON.parse(d).login;
    });
  });
  gh_req.on('error', (e) => {
    res.locals.message = e.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    res.status(err.status || 500);
    res.render('error');
    console.error(e);
    return "Error";
  });
  gh_req.end();
}

module.exports = router;