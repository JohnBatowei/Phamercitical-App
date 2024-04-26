const mongoose = require("mongoose");
const stockdb = new mongoose.Schema(
  {
    productname: {
      type: String,
      required: true,
    },
    productquantity: {
      type: Number,
      required: true
    },
    retailprice: {
      type: Number,
      required: true
    },
    balance: {
      type: Number,
      required: true
    },
    quantityleft: {
      type: Number,
      required: true
    },
    drugid: {
      type: String,
      required: true,
      unique:true,
    },
  },
  { timestamps: true }
);

const stockDB = mongoose.model("stock", stockdb);
module.exports = stockDB;
