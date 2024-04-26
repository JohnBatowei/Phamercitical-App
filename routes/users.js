var express = require("express");
const bcrypt = require('bcrypt')
const midDB = require("../db/admin/midAdmin");
const superDB = require("../db/admin/superAdmin");
const { superUserAuth } = require("../auth/auth");
var router = express.Router();

/* GET users listing. */
router.get("/super", async function(req, res, next) {
  const superb = {
    saltRounds: 10,
    password: "admins",
    email: "admin@admin.com",
    userName: "UMC"
  };

  try {
    const hashedPwd = await bcrypt.hash(superb.password, superb.saltRounds);
    let admin = new superDB({
      userName: superb.userName,
      email: superb.email,
      password: hashedPwd
    });

    admin
      .save()
      .then(data => {
        req.flash("successMessage", "You have created a director's account");
        res.redirect("/");
        console.log(`admin is recorded`);
      })
      .catch(err => {
        console.log(err);
      });
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server error Occured");
  }
});

router.post("/mid",superUserAuth, async function(req, res, next) {

  try {
    const finduser = await midDB.findOne({email:req.body.email})
    if(finduser){
      req.flash("errorMessage", "This user already exist");
      res.redirect("/supercontrol/create");
    }else{
      const hashedPwd = await bcrypt.hash(req.body.password, 10);
      let form = new midDB({
        userName: req.body.userName,
        email: req.body.email,
        password: hashedPwd,
        // image: req.file.filename
      });
      form
        .save()
        .then(result => {
          req.flash("successMessage", "Manager account created successfully");
          res.redirect("/supercontrol/create");
        })
        .catch(err => {
          return console.log(err);
        });
    }
  } catch (error) {
    res.redirect("/supercontrol/create");
    console.log(error)
  }
});

module.exports = router;
