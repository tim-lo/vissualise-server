var   express = require("express"),
      https = require("https"),
      mongoose = require("mongoose"),
      Promise = require("bluebird");
      request = require("request-promise-native");
var   router = express.Router();
const StringDecoder = require("string_decoder").StringDecoder;
const decoder = new StringDecoder("utf8");
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
var   ACCESS_TOKEN = null;
var   AUTH_TOKEN = null;
var   Users = null;

router.use(function (req, res, next) {
  // var UsersSchema = mongoose.Schema({
  //   name: String,
  //   token: String
  // }, {
  //   collection: "Users",
  //   minimize: false
  // });
  // var Users = mongoose.model("Users", UsersSchema);
  // var JohnDoe = new Users({
  //   name: "John Doe",
  //   token: "123456789"
  // });
  // console.log("Hello, my name is " + JohnDoe.name);
  // JohnDoe.save((err, JohnDoe) => {
  //   if (err) return console.error(err);
  //   console.log("User saved!");
  //   Users.find((err, users) => {
  //     if (err) return console.error(err);
  //     console.log("All users: " + users);
  //   })
  // });
  Users = req.app.locals.Users;
  next();
});

/* Grabs the temporary auth code and gets the access token. */
router.get("/", function(req, res, next) {
  console.log("Code value: " + req.query.code);
  AUTH_TOKEN = req.query.code;

  var options = {
    method: "POST",
    uri: "https://github.com/login/oauth/access_token?client_id=" + CLIENT_ID + "&client_secret=" + CLIENT_SECRET + "&code=" + AUTH_TOKEN,
    headers: {
      "Accept": "application/json"
    },
    json: true
  };

  request(options).then((parsedBody) => {
    console.log("Body: " + JSON.stringify(parsedBody));
    ACCESS_TOKEN = parsedBody;
    options = {
      method: "GET",
      uri: "https://api.github.com/user",
      headers: {
        "User-Agent": "Vissualise",
        "Authorization": "token " + ACCESS_TOKEN["access_token"],
        "Accept": "application/json"
      },
      json: true
    };
    request(options).then((parsedBody) => {

      console.log("Body: " + JSON.stringify(parsedBody));
      console.log("Authenticated user: " + parsedBody.login);
      res.render("graph", { title: "Welcome " + parsedBody.login, message: "Code value: " + req.query.code + " Access token: " + ACCESS_TOKEN["access_token"]});
      var newUser = new Users({
        name: parsedBody.login,
        token: ACCESS_TOKEN["access_token"]
      });
      Users.findOne({ "name": parsedBody.login }, (err, existingUser) => {
        if (err) return console.log("Error querying database: " + err);
        console.log("Authenticated user in database!");
      });
      console.log("Adding " + newUser.name + " to the database...");
      newUser.save((err, newUser) => {
        if (err) return console.error(err);
        console.log("User saved!");
        Users.find((err, users) => {
          if (err) return console.error(err);
          console.log("All users: " + users);
        })
      });

    }).catch((error) => {
      console.log("Error: " + error);
      res.render("graph", { title: "Error - Vissualise", message: error });
    });
  }).catch((error) => {
    console.log("Error: " + error);
    res.render("graph", { title: "Error - Vissualise", message: error });
  });
});

module.exports = router;