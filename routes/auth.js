var   express = require("express"),
      https = require("https"),
      mongoose = require("mongoose");
var   router = express.Router();
const StringDecoder = require("string_decoder").StringDecoder;
const decoder = new StringDecoder("utf8");
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
var   ACCESS_TOKEN;
var   ACCESS_SCOPE;

/* Grabs the temporary auth code and gets the access token. */
router.get("/", function(req, res, next) {
  console.log("Code value: " + req.query.code);
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

  getUserID().then(getUserRepos());
});

function getUserID() {
  var options = {
    method: "POST",
    hostname: "github.com",
    path: "/login/oauth/access_token?client_id=" + CLIENT_ID + "&client_secret=" + CLIENT_SECRET + "&code=" + req.query.code,
    headers: {
      "Accept": "application/json"
    }
  };

  var GHRequest = https.request(options, (GHResponse) => {
    console.log("Response: " + GHResponse);
    console.log("Status code: " + GHResponse.statusCode);
    console.log("Response headers: " + JSON.stringify(GHResponse.headers));
    GHResponse.on("data", (d) => {
      /* Return JSON format: {"access_token":"ACCESS_TOKEN","token_type":"bearer","scope":"repo,user:email"} */
      ACCESS_TOKEN = JSON.parse(d.toString())["access_token"];
      ACCESS_SCOPE = JSON.parse(d.toString())["scope"];
      res.render("graph", { title: "That worked!", message: "Code value: " + req.query.code + " Access token: " + ACCESS_TOKEN});
    });
  });

  GHRequest.on("error", (e) => {
    res.locals.message = e.message;
    res.locals.error = req.app.get("env") === "development" ? err : {};
    res.status(err.status || 500);
    res.render("error");
    console.error(e);
  });

  GHRequest.end();
}

function getUserRepos() {
  var responseData;
  var options = {
    method: "GET",
    hostname: "api.github.com",
    path: "/user",
    headers: {
      "User-Agent": "Vissualise",
      "Authorization": "token " + ACCESS_TOKEN["access_token"],
      "Accept": "application/json"
    }
  };

  var GHRequest = https.request(options, (GHResponse) => {
    console.log("Response: " + GHResponse);
    console.log("Status code: " + GHResponse.statusCode);
    console.log("Response headers: " + JSON.stringify(GHResponse.headers));
    GHResponse.on("data", (d) => {
      console.log(d);
    });
  });

  GHRequest.on("error", (e) => {
    res.locals.message = e.message;
    res.locals.error = req.app.get("env") === "development" ? err : {};
    res.status(err.status || 500);
    res.render("error");
    console.error(e);
  });
  
  GHRequest.end();
}

module.exports = router;