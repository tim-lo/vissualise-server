var bodyParser = require("body-parser");
var cookieParser = require("cookie-parser");
var express = require("express");
var favicon = require("serve-favicon");
var logger = require("morgan");
var mongoose = require("mongoose");
var path = require("path");

var auth = require("./routes/auth");
var index = require("./routes/index");
var users = require("./routes/users");

var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");
app.set();

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, "public", "favicon.ico")));
app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(require("node-sass-middleware")({
  src: path.join(__dirname, "public"),
  dest: path.join(__dirname, "public"),
  indentedSyntax: true,
  sourceMap: true
}));
app.use(express.static(path.join(__dirname, "public")));

app.use("/", index);
app.use("/users", users);
app.use("/auth", auth);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error("Not Found");
  err.status = 404;
  next(err);
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

mongoose.connect("mongodb://vissualise:vissualise@ds157829.mlab.com:57829/heroku_d91pg99g");
var db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error: "));
db.on("open", function() {
  console.log("MongoDB connection successful!");
  app.locals.db = db;
})

module.exports = app;
