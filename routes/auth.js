var express = require('express');
var router = express.Router();

const client_id = "da3d5188a6954fdd74f6";
const client_secret = "45766ce64775b29c7e544f6e1484ffbd57f3c732";

/* Grabs the temporary auth code and gets the access token. */
router.get('/', function(req, res, next) {
  console.log("Code value: " + req.query.code);
  res.render('index', { title: 'Code value: ' + req.query.code });
});

module.exports = router;
