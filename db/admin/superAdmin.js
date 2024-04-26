const mongoose = require("mongoose");
const dbsuper = new mongoose.Schema(
  {
    userName: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique:true,
    },
    password: {
      type: String,
      required: true
    },
    // image: {
    //   type: String
    // }
  },
  { timestamps: true }
);

const superDB = mongoose.model("dbsuper", dbsuper);
module.exports = superDB;