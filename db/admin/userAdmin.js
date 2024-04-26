const mongoose = require("mongoose");
const dbUsers = new mongoose.Schema(
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

const usersDB = mongoose.model("dbuser", dbUsers);
module.exports = usersDB;
