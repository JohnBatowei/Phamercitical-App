var express = require("express");
const { midUserAuth } = require("../../auth/auth");
const salesDB = require("../../db/admin/pharmdb/sales");
const stockDB = require("../../db/admin/pharmdb/stock");
const usersDB = require("../../db/admin/userAdmin");
const suppliersDB = require("../../db/admin/pharmdb/suppliers");
const midDB = require("../../db/admin/midAdmin");
const expensesModel = require("../../db/admin/pharmdb/expenses");
const multiSalesDB = require("../../db/admin/pharmdb/multiSales");

var router = express.Router();

/* GET home page. */
router.get("/:id", midUserAuth, async function(req, res, next) {
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

    const userid = req.params.id;
    const userid1 = req.params.id;
    const userids = await midDB.findById(userid1);
    // console.log(userids);

    // let profit = [];
    let totalprofit = 0;
    const users = await expensesModel.find().sort({ createdAt: -1 });
    let expense = []
    let totalExpense = 0
    
    if(users.length > 0 ){
        users.forEach(item =>{
          expense.push(item.amount)
          totalExpense += parseFloat(item.amount)
        })
       // let total = expense.reduce((i,j)=> i+j)
    }
totalprofit += totalbalance-totalExpense

    res.render("middashboard/bmcRecords", {
      title: "Express",
      // data: datas.userName,
      stock,
      userids,
      userid,
      totalProduct,
      totalbalance: totalbalance.toLocaleString(),
      totalcategories,
      newCart,
      totalprofit: totalprofit.toLocaleString(),
      sale: sale.toLocaleString(),
      successMessage: req.flash("successMessage"),
      errorMessage: req.flash("errorMessage"),
      layout: "./layouts/midLay"
    });
  } catch (error) {
    console.log(error);
  }
});



router.get("/addstocks/:id", midUserAuth, async function(req, res, next) {
  const userid = req.params.id;
  const userid1 = req.params.id;
  const userids = await midDB.findById(userid1);

  const stock = await stockDB.find().sort({ createdAt: -1 });
  res.render("middashboard/addStock", {
    title: "Express",
    stock,
    userid,
    userids,
    // data: datas.userName,
    successMessage: req.flash("successMessage"),
    errorMessage: req.flash("errorMessage"),
    layout: "./layouts/midLay"
  });
});



router.get("/makesales/:id", midUserAuth, async function(req, res, next) {
  const userid = req.params.id;
  const userid1 = req.params.id;
  const userids = await midDB.findById(userid1);

  const productDrugs = await salesDB.find().sort({ createdAt: -1 });
  res.render("middashboard/makesales", {
    title: "Express",
    productDrugs,
    userid,
    userids,
    // data: datas.userName,
    successMessage: req.flash("successMessage"),
    errorMessage: req.flash("errorMessage"),
    layout: "./layouts/midLay"
  });
});



router.get("/create/:id", midUserAuth, async function(req, res, next) {
  const userid = req.params.id;
  const userid1 = req.params.id;
  const userids = await midDB.findById(userid1);

  const users = await usersDB.find().sort({ createdAt: -1 });
  res.render("middashboard/register", {
    title: "Express",
    users,
    userids,
    userid,
    // data: datas.userName,
    successMessage: req.flash("successMessage"),
    errorMessage: req.flash("errorMessage"),
    layout: "./layouts/midLay"
  });
});



router.post("/expenses/:id", midUserAuth, async function(req, res, next) {
  try {
    const userid = req.params.id;

      await expensesModel(req.body).save().then(result => {
        req.flash(
          "successMessage",
          " Expenses added successfully"
        );
        res.redirect(`/midcontrol/supplier/${userid}`);
      });
    
  } catch (error) {
    console.log(error);
  }
});


// suppliers route has been changed to expenses route
router.get("/supplier/:id", midUserAuth, async function(req, res, next) {
  const userid = req.params.id;
  const userid1 = req.params.id;
  const userids = await midDB.findById(userid1);

  // const users = await suppliersDB.find().sort({ createdAt: -1 });
  const users = await expensesModel.find().sort({ createdAt: -1 });
  let expense = []
  let totalExpense = 0
  
  if(users.length > 0 ){
      users.forEach(item =>{
        expense.push(item.amount)
        totalExpense += parseInt(item.amount)
      })
  }

    // console.log(totalExpense)
  res.render("middashboard/supplier", {
    title: "Express",
    users,
    userids,
    userid,totalExpense,
    // data: datas.userName,
    successMessage: req.flash("successMessage"),
    errorMessage: req.flash("errorMessage"),
    layout: "./layouts/midLay"
  });
});



// Helper function to convert month and year (e.g., "2023-07") to month name (e.g., "July")
function getMonthName(monthYear) {
  const [year, month] = monthYear.split("-");
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  return `${monthNames[parseInt(month) - 1]} ${year}`;
}

// Helper function to get the start and end dates of the current month
function getStartAndEndOfMonth() {
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Get the first day of the current month
  const firstDay = new Date(year, month, 1);

  // Get the last day of the current month
  const lastDay = new Date(year, month + 1, 0);

  // Return the start and end dates as an object
  return {
    startDate: firstDay,
    endDate: lastDay,
  };
}

router.get("/reports/:id", midUserAuth, async function (req, res, next) {
  try {
    const userid = req.params.id;
    const userid1 = req.params.id;
    const userids = await midDB.findById(userid1);

    // Aggregate expenses based on month and year
   const expensesByMonth = await expensesModel.aggregate([
      {
        $match: {
          // Add a filter for specific user expenses if needed
          // userId: userid,
        },
      },
      {
        $group: {
          // _id: "$monthYear", // Group by the "monthYear" virtual field
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          totalExpense: { $sum: { $toInt: "$amount" } }, // Calculate the total expense for each month
        },
      },
      {
        $project: {
          _id: 0, // Exclude the default _id field from the result
          monthYear: "$_id", // Rename the _id field to monthYear
          totalExpense: 1, // Include the totalExpense field in the result
        },
      },
      {
        $sort: { monthYear: -1 }, // Sort in descending order based on the "monthYear" field
      },
    ]);

    
    // console.log(expensesByMonth)
    // Aggregate sales based on month and year
    const salesByMonth = await multiSalesDB.aggregate([
      {
        $match: { status: true } // Only consider documents with status set to true
      },
      {
        $unwind: "$multiSales" // Unwind the multiSales array to work with individual products
      },
      {
        $group: {
          _id: {
            monthYear: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
            productname: { $toLower: "$multiSales.productname" } // Convert product name to lowercase for case-insensitive grouping
          },
          totalSales: { $sum: "$multiSales.sellingprice" }, // Calculate the total sales for each month and product
          totalQuantity: { $sum: "$multiSales.productquantity" } // Calculate the total quantity sold for each month and product
        }
      },
      {
        $group: {
          _id: "$_id.monthYear",
          totalSaless: { $sum: "$multiSales.sellingprice" }, 
          products: {
            $push: {
              name: "$_id.productname",
              quantity: "$totalQuantity"
            }
          }, // Collect product data for each month
          totalSales: { $sum: "$totalSales" }, // Calculate the total sales for each month
          totalQuantity: { $sum: "$totalQuantity" } // Calculate the total quantity sold for each month
        }
      },
      {
        $project: {
          _id: 0, // Exclude the default _id field from the result
          monthYear: "$_id", // Rename the _id field to monthYear
          totalSales: 1, // Include the totalSales field in the result
          products: 1, // Include the products field in the result
          totalQuantity: 1 // Include the totalQuantity field in the result
        }
      },
      {
        $sort: { monthYear: -1 } // Sort in descending order based on the "monthYear" field
      }
    ]);


    // const salesByMonthSalesDB = await salesDB.aggregate([
    //   {
    //     $group: {
    //       _id: {
    //         monthYear: { $dateToString: { format: "%Y-%m", date: "$createdAt" } }
    //       },
    //       totalSellingPrice: { $sum: "$sellingprice" }, // Calculate the total selling price for each month
    //       products: {
    //         $push: {
    //           name: { $toLower: "$productname" }, // Convert product name to lowercase for case-insensitive grouping
    //           quantity: "$productquantity"
    //         }
    //       } // Collect product data for each month
    //     }
    //   },
    //   {
    //     $project: {
    //       _id: 0, // Exclude the default _id field from the result
    //       monthYear: "$_id.monthYear", // Rename the _id.field to monthYear
    //       totalSellingPrice: 1, // Include the totalSellingPrice field in the result
    //       products: 1, // Include the products field in the result
    //       totalQuantity: { $sum: "$products.quantity" } // Calculate the total quantity sold for each month
    //     }
    //   },
    //   {
    //     $sort: { monthYear: -1 } // Sort in descending order based on the "monthYear" field
    //   }
    // ]);
    
    // console.log(salesByMonthSalesDB)
    
// console.log(salesByMonth)

    // Get the start and end dates of the current month
    
    
    const { startDate, endDate } = getStartAndEndOfMonth();

    // Find the sales within the current month
    const monthlySales = await multiSalesDB.find({
      createdAt: {
        $gte: startDate,
        $lte: endDate,
      },
      status: true, // Assuming "status" indicates a successful sale
    }).sort({ createdAt: -1 });


    res.render("middashboard/report", {
      title: "Express",
      userids,
      userid,
      monthlySales,
      expensesByMonth,
      salesByMonth,
      getMonthName,
      successMessage: req.flash("successMessage"),
      errorMessage: req.flash("errorMessage"),
      layout: "./layouts/midLay",
    });
  } catch (error) {
    console.log(error.message);
  }
});


router.get("/daily-reports/:id", midUserAuth, async function (req, res, next) {
  try {
    const userid = req.params.id;
    const userid1 = req.params.id;
    const userids = await midDB.findById(userid1);

    // console.log(expensesByMonth)
    // Aggregate sales based on month and year
    const salesByDay = await multiSalesDB.aggregate([
      {
        $match: { status: true } // Only consider documents with status set to true
      },
      {
        $unwind: "$multiSales" // Unwind the multiSales array to work with individual products
      },
      {
        $group: {
          _id: {
            dayYearMonth: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            productname: { $toLower: "$multiSales.productname" } // Convert product name to lowercase for case-insensitive grouping
          },
          totalSales: { $sum: "$multiSales.sellingprice" }, // Calculate the total sales for each day and product
          totalQuantity: { $sum: "$multiSales.productquantity" } // Calculate the total quantity sold for each day and product
        }
      },
      {
        $group: {
          _id: "$_id.dayYearMonth",
          totalSaless: { $sum: "$multiSales.sellingprice" },
          products: {
            $push: {
              name: "$_id.productname",
              quantity: "$totalQuantity"
            }
          }, // Collect product data for each day
          totalSales: { $sum: "$totalSales" }, // Calculate the total sales for each day
          totalQuantity: { $sum: "$totalQuantity" } // Calculate the total quantity sold for each day
        }
      },
      {
        $project: {
          _id: 0, // Exclude the default _id field from the result
          day: "$_id", // Rename the _id field to day
          totalSales: 1, // Include the totalSales field in the result
          products: 1, // Include the products field in the result
          totalQuantity: 1 // Include the totalQuantity field in the result
        }
      },
      {
        $sort: { day: -1 } // Sort in descending order based on the "day" field
      }
    ]);
    


    res.render("middashboard/daily-report", {
      title: "Daily Sales Report",
      userids,
      userid,
      salesByDay,
      successMessage: req.flash("successMessage"),
      errorMessage: req.flash("errorMessage"),
      layout: "./layouts/midLay",
    });
  } catch (error) {
    console.log(error.message);
  }
});




// user view
router.get("/:u/:id/edit", midUserAuth, async (req, res) => {
  try {
    const userid1 = req.params.u;
    const userid = req.params.u;
    console.log(userid1);
    const userids = await midDB.findById(userid1);
    const sales = await stockDB.findById(req.params.id);
    if (sales) {
      res.render("middashboard/editstock", {
        sales,
        userids,
        userid,
        title: "edit page",
        layout: "./layouts/midLay"
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



//the update route
router.put("/:u/:id/update", midUserAuth, async (req, res) => {
  try {
    const userid1 = req.params.u;
    const userid = req.params.u;
    console.log(userid1);
    const userids = await midDB.findById(userid1);
    const stock = await stockDB.findById(req.params.id);
    if (stock) {
   
      stock.productname = req.body.productname;
      stock.productquantity = req.body.productquantity;
      stock.retailprice = req.body.retailprice;
      stock.balance = req.body.balance;
      stock.quantityleft = req.body.quantityleft;

      await stock.save();
      req.flash(
        "successMessage",
        `the changes for ${stock.productname} was seccessful !!!`
      );
      res.redirect(`/midcontrol/addstocks/${userid}`);
      // res.redirect("/midcontrol/addstocks");
    }
    
  } catch (error) {
    console.log(error);
  }
});



router.delete("/:u/:id/delete", midUserAuth, async (req, res) => {
  const id = req.params.u;
  const idd = req.params.id;
  await suppliersDB
    .findByIdAndDelete(idd)
    .then(result => {
      req.flash("successMessage", `suppliers account deleted successfully !!!`);
      res.redirect(`/midcontrol/supplier/${id}`);
      // res.json({ redirect: "/admin/ReceiptPage" });
    })
    .catch(err => {
      req.flash("errorMessage", `${err.message}`);
      res.redirect(`/midcontrol/supplier/${id}`);
      // console.log(err.message);
    });
});

module.exports = router;
