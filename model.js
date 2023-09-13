const mongoose = require("mongoose");
const User = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  balance: {
    type: Number,
    default: 0,
    required: true,
  },
});
const Transactions = mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  total: {
    type: Number,
    default: 0,
    required: true,
  },
  TXAmount: {
    type: Number,
    required: true,
    default: 0,
  },
  whatTX: {
    type: String,
    enum: ["deposit", "withdraw"],
    required: true,
  },
  type: String,
});

const USR = mongoose.model("User", User);
const TX = mongoose.model("Transactions", Transactions);
module.exports = { USR, TX };
