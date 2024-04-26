var express = require("express");
const { superUserAuth } = require("../../auth/auth");
const midDB = require("../../db/admin/midAdmin");
const salesDB = require("../../db/admin/pharmdb/sales");
const stockDB = require("../../db/admin/pharmdb/stock");
const usersDB = require("../../db/admin/userAdmin");
const expensesModel = require("../../db/admin/pharmdb/expenses");

var router = express.Router();

/* GET home page. */
router.get("/", superUserAuth, async function(req, res, next) {

try {
  const sales0 = await salesDB.find();
  let saleArray = [];
  let sale = 0;
  if (sales0.length > 0) {
    sales0.forEach(item => {
      a = item.sellingprice;
      saleArray.push(a);
      let total = saleArray.reduce((index1, index2) => index1 + index2);
      sale = total;
    });
  }

  const stock = await stockDB.find().sort({ createdAt: -1 });
  let totalProduct = 0;
  let product = [];
  let categories = [];
  let balance = [];
  let totalbalance = 0;
  let totalcategories = 0;
  let qttleft = [];
  let newqttleft = [];
  let totalqttleft = 0;
  let newCart = 0;
  if (stock.length > 0) {
    //Gods divine knowledge
    //this loop calculte the total salary from the mongoDB
    //and also total index which equals to the total staff
    stock.forEach((item, index) => {
      a = item.productquantity;
      product.push(a);
      let total = product.reduce((index1, index2) => index1 + index2);
      totalProduct = total;

      b = item.balance;
      balance.push(b);
      let totalb = balance.reduce((ind1, ind2) => ind1 + ind2);
      totalbalance = totalb;

      e = item.quantityleft;
      qttleft.push(e);

      c = index;
      categories.push(c);
      totalcategories = categories.length;
    });
    qttleft.forEach(item => {
      if (item > 0) {
        let qut = item;
        newqttleft.push(qut);

        newCart = newqttleft.length;

      }
    });
  }


  // console.log(userids);

  // let profit = [];
  let totalprofit = 0;
  const users = await expensesModel.find().sort({ createdAt: -1 });
  let expense = []
  let totalExpense = 0
  
  if(users.length > 0 ){
      users.forEach(item =>{
        expense.push(item.amount)
        totalExpense += parseInt(item.amount)
      })
     // let total = expense.reduce((i,j)=> i+j)
  }
totalprofit += totalbalance-totalExpense
 
  res.render("superdashboard/bmcRecords", {
    title: "Express",
    // data: datas.userName,
    stock,
    totalProduct,
    totalbalance:totalbalance.toLocaleString(),
    totalcategories,newCart,
    totalprofit:totalprofit.toLocaleString(),sale:sale.toLocaleString(),
    successMessage: req.flash("successMessage"),
    errorMessage: req.flash("errorMessage"),
    layout: "./layouts/superLay"
  });
} catch (error) {
  console.log(error)
}
});

router.get("/addstocks", superUserAuth, async function(req, res, next) {
  const stock = await stockDB.find().sort({ createdAt: -1 });
  res.render("superdashboard/addStock", {
    title: "Express",
    stock,
    // data: datas.userName,
    successMessage: req.flash("successMessage"),
    errorMessage: req.flash("errorMessage"),
    layout: "./layouts/superLay"
  });
});

router.get("/makesales", superUserAuth, async function(req, res, next) {
  const productDrugs = await salesDB.find().sort({ createdAt: -1 });
  res.render("superdashboard/makesales", {
    title: "Express",
    productDrugs,
    // data: datas.userName,
    successMessage: req.flash("successMessage"),
    errorMessage: req.flash("errorMessage"),
    layout: "./layouts/superLay"
  });
});

router.get("/create", superUserAuth, async function(req, res, next) {
  const users = await usersDB.find().sort({ createdAt: -1 });
  const midusers = await  midDB.find().sort({ createdAt: -1 });
 
  res.render("superdashboard/register", {
    title: "Express",
    users,midusers,
    // data: datas.userName,
    successMessage: req.flash("successMessage"),
    errorMessage: req.flash("errorMessage"),
    layout: "./layouts/superLay"
  });
});

// user view
router.get("/:id", superUserAuth, async (req, res) => {
  try {
    const sales = await salesDB.findById(req.params.id);
    if (sales) {
      res.render("superdashboard/viewsales", {
        sales,
        title: "view page",
        layout: "./layouts/printLay"
      });
    } else {
      // const receipt = await receiptModel.findById(req.params.id);
      // res.render("view/userViewRecpt", {
      //   rcpt: receipt,
      //   title: "view page",
      //   layout: "./layouts/viewLayout",
      // });
      // res.send(' show saless datas '+ req.params.id)
    }
  } catch (error) {
    console.log(error);
  }
});

router.delete("/:id/middelete", superUserAuth,(req, res) => {
  const id = req.params.id;
  midDB
    .findByIdAndDelete(id)
    .then((result) => {
      req.flash("successMessage", `user sales account deleted successfully !!!`);
      res.redirect("/supercontrol/create");
      // res.json({ redirect: "/admin/ReceiptPage" });
    })
    .catch((err) => {
      req.flash("errorMessage", `${err.message}`);
      res.redirect("/supercontrol/create");
      // console.log(err.message);
    });

});

router.delete("/:id/userdelete", superUserAuth,(req, res) => {
  const id = req.params.id;
 usersDB
    .findByIdAndDelete(id)
    .then((result) => {
      req.flash("successMessage", `user sales account deleted successfully !!!`);
      res.redirect("/supercontrol/create");
      // res.json({ redirect: "/admin/ReceiptPage" });
    })
    .catch((err) => {
      req.flash("errorMessage", `${err.message}`);
      res.redirect("/supercontrol/create");
      // console.log(err.message);
    });

});
module.exports = router;
