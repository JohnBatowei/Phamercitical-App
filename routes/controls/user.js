var express = require("express");
const { userAuth } = require("../../auth/auth");
const multiSalesDB = require("../../db/admin/pharmdb/multiSales");
const salesDB = require("../../db/admin/pharmdb/sales");
const stockDB = require("../../db/admin/pharmdb/stock");
const usersDB = require("../../db/admin/userAdmin");
const expensesModel = require("../../db/admin/pharmdb/expenses");

var router = express.Router();



router.post('/print',async(req,res)=>{
  
const {id,cartNum,user} = req.body
// console.log(req.body)
      const printSales = await multiSalesDB.findOne({_id: id,cartName: cartNum})
      if(!printSales){
        console.log('could not find')
        return res.status(400).json({error:'cant find data'})
      }
      // console.log(printSales)
      res.status(200).json({redirect: `/usercontrol/issue-receipt/${printSales._id}`})
})


router.get('/issue-receipt/:id',async(req,res)=>{

 try {
   // res.send('welcome '+req.params.id)
   const printSales = await multiSalesDB.findById({_id: req.params.id}).populate('multiSales')
  //  const user = await usersDB.findById({_id: req.params.user})
  //  console.log(printSales)
   if(printSales){
    return res.status(200).render('userdashboard/print',{printSales})
   }
  throw 'could not fetch'
 } catch (error) {
  console.log(error.message)
 }

})



router.put("/save-cart", async (req, res) => {
  try {
    let { productId, cartNum, total, soldedate } = req.body;

    const cart = await multiSalesDB.findOne({ cartName: cartNum }).populate('multiSales');
    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }


    for (const product of cart.multiSales) {
      const findStockdrugid = await stockDB.findOne({ drugid: product.drugid });
      if (!findStockdrugid) {
        return res.status(404).json({ error: 'Product not found in stock records' });
      }

      const left = findStockdrugid.quantityleft - product.productquantity;
      if (left < 0) {
        return res.status(400).json({ error: 'Insufficient quantity in stock' });
      }

      findStockdrugid.quantityleft = left;
      await findStockdrugid.save();

      // Generate the current date
    const currentDate = new Date();

    // Format the date as needed (e.g., YYYY-MM-DD)
    const formattedDate = currentDate.toISOString().split('T')[0];

      const newSale = new salesDB({
        drugid: product.drugid,
        productname: product.productname,
        productquantity: product.productquantity,
        sellingprice: product.sellingprice,
        soldedate: formattedDate, // Include the soldedate field here
        cashiername: product.cashiername
      });

     let newsale = await newSale.save();
     if(!newsale){
      return res.status(400).json({ error: 'Insufficient quantity in stock' })
     }
    }

   

    cart.status = true;
    cart.total = total;
    const cartSaved = await cart.save();
    if (!cartSaved) {
      return res.status(500).json({ error: 'Failed to save cart' });
    }

   

    res.json({ message: 'Cart saved successfully' });
  } catch (error) {
    console.error('An error occurred while saving the cart:', error);
    res.status(500).json({ error: 'Failed to save cart' });
  }
});


router.delete("/del-cart", async (req, res) => {
  try {
    let { cartNum } = req.body;

    // Find the cart by its cartNum
    const cart = await multiSalesDB.findOneAndDelete({ cartName: cartNum });
    res.json({ message: "Product removed successfully" });
  } catch (error) {
    console.error("An error occurred while removing the product:", error);
    res.status(500).json({ error: "Failed to remove product" });
  }
});

router.delete("/cart", async (req, res) => {
  try {
    let { productId, itemId, cartNum } = req.body;

    // Typecast the productId and itemId if needed
    productId = String(productId);
    itemId = String(itemId);

    // Find the cart by its cartNum
    const cart = await multiSalesDB.findOne({ cartName: cartNum });

    if (!cart) {
      return res.status(404).json({ error: "Cart not found" });
    }

    // Find the product index in the multiSales array
    const productIndex = cart.multiSales.findIndex(product => {
      return (
        String(product._id) === productId && String(product.drugid) === itemId
      );
    });

    console.log(productIndex);
    if (productIndex === -1) {
      return res.status(404).json({ error: "Product not found in the cart" });
    }

    // Remove the product from the multiSales array
    cart.multiSales.splice(productIndex, 1);

    // Save the updated cart
    await cart.save();

    res.json({ message: "Product removed successfully" });
  } catch (error) {
    console.error("An error occurred while removing the product:", error);
    res.status(500).json({ error: "Failed to remove product" });
  }
});


router.post("/create-cart", userAuth,async (req, res) => {
  try {
    // const userID = req.session.userid
    // console.log(userID)
    function generateUniqueCode(length) {
      const unique = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      let result = "";
      for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * unique.length);
        result += unique[randomIndex];
      }
      return result;
    }

    const { user, drugid, productname, productquantity, sellingprice, cashiername } = req.body;

    // Validate the required fields
    if (!drugid || !productname || !productquantity || !sellingprice || !cashiername) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const findStockdrugid = await stockDB.findOne({ drugid });

    if (!findStockdrugid) {
      return res.status(404).json({ error: "No product found" });
    }

    if (productquantity > findStockdrugid.quantityleft) {
      return res.status(400).json({ error: "Quantity is more than the quantity in stock" });
    }
    if (productquantity <= 0) {
      return res.status(400).json({ error: "Quantity cannot be less than 1" });
    }

    const cart = await multiSalesDB.findOne({ status: false, user });

if (!cart) {
  const genCode = generateUniqueCode(6);
  const newCart = new multiSalesDB({
    user: user,
    cartName: genCode,
    multiSales: [{ drugid, productname, productquantity, sellingprice, cashiername }],
    status: false,
    cashiername,
    total: 0
  });

      const savedCart = await newCart.save();
      // console.log(savedCart, "saved cart");
      return res.json(savedCart);
    } 
    else {
      const existingProduct = cart.multiSales.find((product) => product.drugid === drugid);

      if (existingProduct) {
        const totalQuantity = parseInt(existingProduct.productquantity) + parseInt(productquantity);
        const totalSellingPrice = parseInt(existingProduct.sellingprice) + parseInt(sellingprice);
        if (totalQuantity > findStockdrugid.quantityleft) {
          return res.status(400).json({ error: "Total quantity exceeds the quantity in stock" });
        }
        existingProduct.productquantity = totalQuantity;
        existingProduct.sellingprice = totalSellingPrice;
      } else {
       
        cart.multiSales.push({ drugid, productname, productquantity, sellingprice, cashiername });
      }

      const savedCart = await cart.save();
      console.log(savedCart, "updated cart");
      return res.json(savedCart);
    }

  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "An error occurred while processing the request" });
  }
});


router.get("/:id", userAuth, async function(req, res, next) {
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
    // let profit = [];
    // let totalprofit = 0;
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

        // d = item.profit;
        // profit.push(d);
        // let totalp = profit.reduce((index1, index2) => index1 + index2);
        // totalprofit = totalp;

        e = item.quantityleft;
        qttleft.push(e);

        // totalqttleft = totalq;

        c = index;
        categories.push(c);
        // for (var i = 0; i <= categories.length; i++) {}
        // totalcategories = totalcategories;
        totalcategories = categories.length;
      });

      qttleft.forEach(item => {
        if (item > 0) {
          let qut = item;
          newqttleft.push(qut);

          newCart = newqttleft.length;
          // console.log(newqttleft.length)
        }
      });
    }

    
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
    const idid = req.session.userid;
    console.log("i discovered this by God grace :" + idid);
    // console.log(newCart);
    const userid = req.params.id;
    const userid1 = req.params.id;
    const userids = await usersDB.findById(userid1);
    // console.log(userids);
    res.render("userdashboard/bmcRecords", {
      title: "Express",
      // data: datas.userName,
      stock,
      userids,
      totalProduct: totalProduct.toLocaleString(),
      totalbalance: totalbalance.toLocaleString(),
      totalcategories,
      newCart,
      totalprofit: totalprofit.toLocaleString(),
      userid,
      sale: sale.toLocaleString(),
      successMessage: req.flash("successMessage"),
      errorMessage: req.flash("errorMessage"),
      layout: "./layouts/userLay"
    });
  } catch (error) {
    console.log(error);
  }
});


router.get("/addstocks/:id", userAuth, async function(req, res, next) {
  const userid = req.params.id;
  const userid1 = req.params.id;
  const userids = await usersDB.findById(userid1);
  const stock = await stockDB.find().sort({ createdAt: -1 });
  res.render("userdashboard/addStock", {
    title: "Express",
    stock,
    userid,
    userids,
    // data: datas.userName,
    successMessage: req.flash("successMessage"),
    errorMessage: req.flash("errorMessage"),
    layout: "./layouts/userLay"
  });
});


const getStartAndEndOfWeek = () => {
  const currentDate = new Date();
  const weekStart = new Date(currentDate);
  weekStart.setHours(0, 0, 0, 0);
  weekStart.setDate(currentDate.getDate() - currentDate.getDay());
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);

  return { startDate: weekStart, endDate: weekEnd };
};

// Function to calculate the week number based on the current date
const getWeekNumber = () => {
  const currentDate = new Date();
  const oneJan = new Date(currentDate.getFullYear(), 0, 1);
  const weekOfYear = Math.ceil(((currentDate - oneJan) / 86400000 + oneJan.getDay() + 1) / 7);
  const weekOfMonth = Math.ceil((currentDate.getDate() + oneJan.getDay()) / 7);

  // Adjust the week of the month if it's the first week of the year
  if (weekOfYear === 1) {
    return { weekOfYear, weekOfMonth: weekOfMonth - 1 };
  }

  return { weekOfYear, weekOfMonth };
};


// Route to render the "weekly-report" page
router.get("/makesales/:id", userAuth, async function (req, res, next) {
  const userid = req.params.id;
  const userids = await usersDB.findById(userid);
  const productDrugs = await salesDB.find({ user: userid }).sort({ createdAt: -1 });

  // Query the database to get all records falling within the current week for the specified user
  const weeklySales = await multiSalesDB.find({
    user: userid,
    createdAt: { $gte: new Date(getStartAndEndOfWeek().startDate), $lte: new Date(getStartAndEndOfWeek().endDate) },
    status: true // Assuming "status" indicates a successful sale
  }).sort({ createdAt: -1 });

  // Calculate the total sales and total items sold within the current week
  let totalSales = 0;
  let totalItemsSold = 0;

  const weekNumber = getWeekNumber();
  weeklySales.forEach((sale) => {
    sale.multiSales.forEach((item) => {
      totalItemsSold += parseInt(item.productquantity);
      totalSales += parseInt(item.sellingprice) ;
    });
  });

  res.render("userdashboard/weekly-report", {
    title: "Weekly Report",
    weekNumber: `Week ${getWeekNumber()}`, // Get the week number dynamically
    ...getStartAndEndOfWeek(),
    productDrugs,
    userid,
    userids,
    totalSales,
    totalItemsSold,
    successMessage: req.flash("successMessage"),
    errorMessage: req.flash("errorMessage"),
    layout: "./layouts/userLay"
  });
});



router.get("/drugid/:u", userAuth, async function(req, res, next) {
  try {
    const id = req.params.u;
    console.log(id);

    const result = await stockDB.findOne({ drugid: id });
    // console.log(result);
    if (result) {
      let a = result.productname;
      let b = result.quantityleft;
      let c = result.retailprice;

      res.status(200).json({ name: a, left: b, price: c });
    } else {
      res.json({ redirect: "/usercontrol/makesales" });
    }
  } catch (error) {
    // res.status(200).json({name:a,left:b,price:c})
    console.log(error);
  }
});


router.get("/drug-name/:u", userAuth, async function(req, res, next) {
  try {
    const id = req.params.u;
    // console.log(id);

    const result = await stockDB.findOne({ _id: id });
    // console.log(result);
    if (result) {
      let a = result.productname;
      let b = result.quantityleft;
      let c = result.retailprice;

      res.status(200).json({ name: a, left: b, price: c });
    } else {
      res.json({ redirect: "/usercontrol/makesales" });
    }
  } catch (error) {
    // res.status(200).json({name:a,left:b,price:c})
    console.log(error);
  }
});



router.get("/multisales/:id", userAuth, async function(req, res, next) {
  try {
    const findProducts = await stockDB.find();
    let prodd = [];
    findProducts.forEach(item => {
      let nameproduct = item.drugid;
      prodd.push(nameproduct);
    });

    
    
    const stock = await stockDB.find().sort({ createdAt: -1 });
    const newStock = stock.filter(item => item.quantityleft > 0);
    // console.log(newStock)
    // console.log(saveCart)
    const userid = req.params.id;
    const userid1 = req.params.id;
    const userids = await usersDB.findById(userid1);
    const productDrugs = await salesDB.find().sort({ createdAt: -1 });
    
    const saveCartSaved = await multiSalesDB.find({ status: true, user: userid }).populate('multiSales').sort({createdAt : -1});
    // const userId = req.session.userid1;
    const saveCart = await multiSalesDB.findOne({ status: false, user: userid });
    
    res.render("userdashboard/mutisales", {
      title: "Express",
      productDrugs,
      userid,
      userids,
      newStock,
      saveCart,
      saveCartSaved,
      successMessage: req.flash("successMessage"),
      errorMessage: req.flash("errorMessage"),
      layout: "./layouts/userLay"
    });
  } catch (error) {
    console.log(error);
  }
});


router.get("/daily-reports/:id", userAuth, async function(req, res, next) {
  try {
 
    const userid = req.params.id;
    const userid1 = req.params.id;
    const userids = await usersDB.findById(userid1);
    // Aggregate sales based on month and year
    const salesByDay = await multiSalesDB.aggregate([
      {
        $match: { status: true, user: userid } // Only consider documents with status set to true
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
    
    
    res.render("userdashboard/daily-report", {
      title: "Express",
      userid,
      salesByDay,
      userids,
      successMessage: req.flash("successMessage"),
      errorMessage: req.flash("errorMessage"),
      layout: "./layouts/userLay"
    });
  } catch (error) {
    console.log(error);
  }
});



// user view
router.get("/:u/:id", userAuth, async (req, res) => {
  const userid = req.params.u;
  console.log(userid);
  const userid1 = req.params.u;
  const userids = await usersDB.findById(userid1);
  try {
    const sales = await salesDB.findById(req.params.id);
    if (sales) {
      res.render("userdashboard/viewsales", {
        sales,
        price: sales.sellingprice.toLocaleString(),
        userid,
        userids,
        title: "view page",
        layout: "./layouts/printLay"
      });
    } else {
   
    }
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
