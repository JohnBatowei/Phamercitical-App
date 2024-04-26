const mongoose = require("mongoose");
const expensesDB = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    amount: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

// Create a virtual field "monthYear" to derive month and year from "createdAt"
expensesDB.virtual("monthYear").get(function () {
  const createdAt = this.createdAt;
  if (!createdAt) return "Unknown Month/Year";
  const month = createdAt.getMonth() + 1; // Months are 0-indexed
  const year = createdAt.getFullYear();
  return `${year}-${String(month).padStart(2, "0")}`;
});

const expensesModel = mongoose.model("expense", expensesDB);
module.exports = expensesModel;
