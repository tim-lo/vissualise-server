var   express = require("express"),
      https = require("https"),
      mongoose = require("mongoose");
var   router = express.Router();
const StringDecoder = require("string_decoder").StringDecoder;
const decoder = new StringDecoder("utf8");
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
var   ACCESS_TOKEN;

/* Grabs the temporary auth code and gets the access token. */
router.get("/", function(req, res, next) {
  console.log("Code value: " + req.query.code);
  mongoose.connect(process.env.MONGODB_URI);
  var db = mongoose.connection;
  db.on("error", console.error.bind(console, "MongoDB connection error: "));
  db.on("open", function() {
    console.log("MongoDB connection successful!");
  });
  // var UsersSchema = mongoose.Schema({
  //   name: String,
  //   token: String
  // });
  // var Users = mongoose.Model("Users", UsersSchema);
  // var JohnDoe = new Users({
  //   name: "John Doe",
  //   token: "123456789"
  // });
  // console.log("Hello, my name is " + JohnDoe.name);

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
      ACCESS_TOKEN = JSON.parse(d.toString());
      getUserRepos();
      res.render("graph", { title: "That worked!", message: "Code value: " + req.query.code + " Access token: " + ACCESS_TOKEN["access_token"]});
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
});

function getUserRepos() {
  var response_data;
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

  var gh_req = https.request(options, (gh_res) => {
    console.log("Response: " + gh_res);
    console.log("Status code: " + gh_res.statusCode);
    console.log("Response headers: " + JSON.stringify(gh_res.headers));
    gh_res.on("data", (d) => {
      var t = d.toString();
      // var u = JSON.parse(t);
      console.log(t);
    });
  });

  gh_req.on("error", (e) => {
    res.locals.message = e.message;
    res.locals.error = req.app.get("env") === "development" ? err : {};
    res.status(err.status || 500);
    res.render("error");
    console.error(e);
  });
  gh_req.end();
}

module.exports = router;