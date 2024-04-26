var express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const {
  upload,
  superUserAuth,
  midUserAuth,
  userAuth
} = require("../../auth/auth");
const superDB = require("../../db/admin/superAdmin");
const userdb = require("../../db/admin/userAdmin");
const midDB = require("../../db/admin/midAdmin");
const usersDB = require("../../db/admin/userAdmin");


/* Register new user*/
router.post("/register/:id",midUserAuth, async (req, res, next) => {
  try {
    const userid = req.params.id
    const userid1 = req.params.id
    const userids = await midDB.findById(userid1)

    const finduser = await userdb.findOne({email:req.body.email})
    if(finduser){
      req.flash("errorMessage", "This sales user already exist");
       res.redirect(`/midcontrol/create/${userid}`);
    }else{
      const hashedPwd = await bcrypt.hash(req.body.password, 10);
      let form = new userdb({
        userName: req.body.userName,
        email: req.body.email,
        password: hashedPwd,
        // image: req.file.filename
      });
      form
        .save()
        .then(result => {
          req.flash("successMessage", "User account created successfully");
          res.redirect(`/midcontrol/create/${userid}`);
        })
        .catch(err => {
          return console.log(err);
        });
    }
  } catch (error) {
    console.log(error)
  }

});



router.post("/registers",superUserAuth, async (req, res, next) => {
  try {
    const finduser = await userdb.findOne({email:req.body.email})
    if(finduser){
      req.flash("errorMessage", "This sales user already exist");
      res.redirect("/supercontrol/create");
    }else{
      const hashedPwd = await bcrypt.hash(req.body.password, 10);
      let form = new userdb({
        userName: req.body.userName,
        email: req.body.email,
        password: hashedPwd,
        // image: req.file.filename
      });
      form
        .save()
        .then(result => {
          req.flash("successMessage", "User account created successfully");
          res.redirect("/supercontrol/create");
        })
        .catch(err => {
          return console.log(err);
        });
    }
  } catch (error) {
    console.log(error)
  }

});



router.post("/", async (req, res) => {
  try {
    //the adminfi
    const superDBa = await superDB.findOne({ email: req.body.email });
    const midDBa = await midDB.findOne({ email: req.body.email });
    const userdba = await userdb.findOne({ email: req.body.email });
    console.log(superDBa);
    if (superDBa) {
      var passwordMatch = await bcrypt.compare(
        req.body.password,
        superDBa.password
      );
      if (passwordMatch) {
        // ..... further code to maintain authentication like jwt or sessions
        req.session.superUserAuth = true;
        req.flash("successMessage", `...Super user Login successful...`);
        res.redirect("/supercontrol");
      } else{
        req.flash("errorMessage", `Ooops !!!, wrong password trying to login`);
        res.redirect("/");
      }
      //end of main admin verification
    } else if (midDBa) {
      var passwordMatchs = await bcrypt.compare(
        req.body.password,
        midDBa.password
      );
      if (passwordMatchs) {
        // ..... further code to maintain authentication like jwt or sessions
        req.session.midUserAuth = true;
        req.flash("successMessage", `welcome ${midDBa.userName}`);
        const users = midDBa
        res.redirect(`/midcontrol/${users.id}`);
        // console.log('mid')
      } else{
        req.flash("errorMessage", `Ooops !!!, wrong password trying to login`);
        res.redirect("/");
      }
      //end of main admin verification
    }else if(userdba) {
      var passwordMatch = await bcrypt.compare(
        req.body.password,
        userdba.password
      );
      if (passwordMatch) {
        // ..... further code to maintain authentication like jwt or sessions
        req.session.userAuth = true;
        req.session.userid = userdba.id
        req.flash("successMessage", `welcome ${userdba.userName}`);
        const users = userdba
        res.redirect(`/usercontrol/${users.id}`);
        // res.send('user')
      } else{
        req.flash("errorMessage", `Ooops !!!, wrong password trying to login`);
        res.redirect("/");
      }
      //end of main admin verification
    }else{
      req.flash("errorMessage", `You dont have an account yet`);
      res.redirect("/");
    }
  } catch (error) {
    console.log(error)
    req.flash("errorMessage", `wrong password or email trying to log in`);
    //  res.redirect("index", { title: "Home" });
    res.status(500).redirect("/");
    //  console.log(error)
  }
});


module.exports = router;
