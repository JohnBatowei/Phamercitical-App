const mongoose = require("mongoose");
const dbmid = new mongoose.Schema(
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

const midDB = mongoose.model("dbmid", dbmid);
module.exports = midDB;
