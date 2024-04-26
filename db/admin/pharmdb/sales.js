const mongoose = require("mongoose");
const salesdb = new mongoose.Schema(
  {
    user: String,
    drugid: {
      type: String,
      required: true,
    },
    productname: {
      type: String,
      required: true
    },
    productquantity: {
      type: Number,
      required: true
    },
    sellingprice: {
      type: Number,
      required: true
    },
    soldedate: {
      type: String,
      required: true
    },
  cashiername: {
      type: String,
      required: true
    }
  },
  {
    toJSON: { virtuals: true }, // Enable virtuals for JSON output
    toObject: { virtuals: true }, // Enable virtuals for Object output
  },
  { timestamps: true }
);

// Create a virtual field "monthYear" to derive month and year from "createdAt"
salesdb.virtual("monthYear").get(function () {
  const month = this.createdAt.getMonth() + 1; // Months are 0-indexed
  const year = this.createdAt.getFullYear();
  return `${month}/${year}`;
});

const salesDB = mongoose.model("sale", salesdb);
module.exports = salesDB;
