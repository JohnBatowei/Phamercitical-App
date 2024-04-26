const mongoose = require("mongoose");
const multiSalesdb = new mongoose.Schema(
  {
    user: String,
    cartName: String,
    multiSales: [
      {
        drugid: String,
        productname: String,
        productquantity: Number,
        sellingprice: Number,
        cashiername: String
      }
    ],
    status: Boolean,
    cashiername: String,
    total: Number
  },
  { timestamps: true }
);

const multiSalesDB = mongoose.model("multiSale", multiSalesdb);
module.exports = multiSalesDB;
