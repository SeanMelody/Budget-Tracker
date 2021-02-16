// Require Mongoose
const mongoose = require("mongoose");

// Set the schema
const Schema = mongoose.Schema;

// Set the transactions columns
const transactionSchema = new Schema(
  {
    name: {
      type: String,
      trim: true,
      required: "Enter a name for transaction"
    },
    value: {
      type: Number,
      required: "Enter an amount"
    },
    date: {
      type: Date,
      default: Date.now
    }
  }
);

// Mongoose schema to transactions
const Transaction = mongoose.model("Transaction", transactionSchema);

// Gotta module.exports!
module.exports = Transaction;
