var   express = require("express");
var   router = express.Router();
const StringDecoder = require("string_decoder").StringDecoder;
const decoder = new StringDecoder("utf8");

router.get("/", (req, res, next) => {
  res.redirect("https://github.com");
});