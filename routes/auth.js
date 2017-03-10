var   express = require("express"),
      https = require("https"),
      mongoose = require("mongoose"),
      request = require("request");
var   router = express.Router();
const StringDecoder = require("string_decoder").StringDecoder;
const decoder = new StringDecoder("utf8");
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
var   ACCESS_TOKEN;

router.use(function (req, res, next) {
  var UsersSchema = mongoose.Schema({
    name: String,
    token: String
  }, {
    collection: "Users",
    minimize: false
  });
  var Users = mongoose.model("Users", UsersSchema);
  var JohnDoe = new Users({
    name: "John Doe",
    token: "123456789"
  });
  console.log("Hello, my name is " + JohnDoe.name);
  JohnDoe.save((err, JohnDoe) => {
    if (err) return console.error(err);
    console.log("User saved!");
    Users.find((err, users) => {
      if (err) return console.error(err);
      console.log("All users: " + users);
    })
  });
  next();
});

/* Grabs the temporary auth code and gets the access token. */
router.get("/", function(req, res, next) {
  console.log("Code value: " + req.query.code);
  /* Return JSON format: {"access_token":"ACCESS_TOKEN","token_type":"bearer","scope":"repo,user:email"} */
  var options = {
    url: "https://github.com/login/oauth/access_token?client_id=" + CLIENT_ID + "&client_secret=" + CLIENT_SECRET + "&code=" + req.query.code,
    headers: {
      "Accept": "application/json"
    }
  };
  request.post(options, (error, response, body) => {
    console.log("Error: ", error);
    console.log("Status Code: ", response && response.statusCode);
    console.log("Body: ", body);
    ACCESS_TOKEN = JSON.parse(body.toString());
    getUserRepos();
    res.render("graph", { title: "That worked!", message: "Code value: " + req.query.code + " Access token: " + ACCESS_TOKEN["access_token"]});
  });
});

function getUserRepos() {
  var options = {
    url: "https://api.github.com/user",
    headers: {
      "User-Agent": "Vissualise",
      "Authorization": "token " + ACCESS_TOKEN["access_token"],
      "Accept": "application/json"
    }
  };
  request.get(options, (error, response, body) => {
    console.log("Error: ", error);
    console.log("Status Code: ", response && response.statusCode);
    console.log("Body: ", body);
    console.log("Authenticated user: " + JSON.parse(body).login);
  });
}

module.exports = router;