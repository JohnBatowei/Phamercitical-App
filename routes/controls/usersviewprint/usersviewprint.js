var express = require("express");
var router = express.Router();

/* GET home page. */
router.get("/", function(req, res, next) {
  res.render("index", {
    title: "Express",
    successMessage: req.flash("successMessage"),
    errorMessage: req.flash("errorMessage")
  });
});

router.get("/login", function(req, res, next) {
  res.render("login", {
    title: "Express",
    successMessage: req.flash("successMessage"),
    errorMessage: req.flash("errorMessage")
  });
});

router.get("/register", function(req, res, next) {
  res.render("register", {
    errorMessage: req.flash("errorMessage")
  });
});

module.exports = router;
