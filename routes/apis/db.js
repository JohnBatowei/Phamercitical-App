var express = require("express");
const salesDB = require("../../db/admin/pharmdb/sales");
const stockDB = require("../../db/admin/pharmdb/stock");
const supplierDB = require('../../db/admin/pharmdb/suppliers')
const {midUserAuth, superUserAuth, userAuth} = require('../../auth/auth')
const router = express.Router();



router.post("/mstock/:id",midUserAuth, async (req, res, next) => {
  try {
    const userid = req.params.id
   
      await stockDB({
        productname: req.body.productname,
        productquantity: req.body.productquantity,
        retailprice: req.body.retailprice,
        balance: req.body.balance,
        quantityleft: req.body.productquantity,
        drugid:req.body.drugid
      })
       .save().then(result => {
        req.flash("successMessage", "Food added successfully");
       
        res.redirect(`/midcontrol/addstocks/${userid}`);
      });
    
  } catch (error) {
    console.log(error)
  }
});



router.post("/makesales/:id", userAuth, async (req, res, next) => {
  try {
    const findStockdrugid = await stockDB.findOne({ drugid: req.body.drugid });
    const userid = req.params.id;

    if (findStockdrugid) {
      if (req.body.productquantity > findStockdrugid.quantityleft || req.body.productquantity <= 0) {
        req.flash("errorMessage", "Either this product with this id is out of stock or you are entering an incorrect quantity value");
        return res.redirect(`/usercontrol/makesales/${userid}`);
      }

      const left = findStockdrugid.quantityleft - req.body.productquantity;
      findStockdrugid.quantityleft = left;
      await findStockdrugid.save();
      
      const newSale = new salesDB({
        user: userid,
        drugid: req.body.drugid,
        productname: req.body.productname,
        productquantity: req.body.productquantity,
        sellingprice: req.body.sellingprice,
        soldedate: req.body.soldedate,
        cashiername: req.body.cashiername
      });

      await newSale.save();

      console.log("New sale made today");
      req.flash("successMessage", "You have made a sale!");
      return res.redirect(`/usercontrol/makesales/${userid}`);
    } else {
      req.flash("errorMessage", "Incorrect drug ID, please check and try again");
      return res.redirect(`/usercontrol/makesales/${userid}`);
    }
  } catch (error) {
    console.log(error);
    req.flash("errorMessage", "An error occurred while making the sale. Please try again.");
    res.redirect(`/usercontrol/makesales/${userid}`);
  }
});

module.exports = router;
