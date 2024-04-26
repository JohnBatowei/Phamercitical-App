const mongoose = require("mongoose");
const supplierDB = new mongoose.Schema(
  {
    suppliername: {
      type: String,
      required: true,
      unique:true,
    },
    address: {
      type: String,
      required: true
    },
    phone: {
      type: Number,
      required: true
    },
  },
  { timestamps: true }
);

const suppliersDB = mongoose.model("suppplier", supplierDB);
module.exports = suppliersDB;
