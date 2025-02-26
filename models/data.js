const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  count: { type: Number, required: true },
  price: { type: Number, required: true },
  flow: { type: Number, required: true },
});

const vendingSchema = new mongoose.Schema({
  products: {
    A: productSchema,
    B: productSchema,
    C: productSchema,
  },
  freeVends: { type: Number, required: true },
});

const changerSchema = new mongoose.Schema({
  nickels: { type: Number, required: true },
  dimes: { type: Number, required: true },
  quarters: { type: Number, required: true },
  totalCashValue: { type: Number, required: true },
});

const errorSchema = new mongoose.Schema({
  tankLow: { type: Boolean, required: true },
  uvFail: { type: Boolean, required: true },
  flowFail: { type: Boolean, required: true },
  mdbFail: { type: Boolean, required: true },
  other: { type: Boolean, required: true },
});

const transactionSchema = new mongoose.Schema({
  escrow: { type: Number, required: true },
  cashTotal: { type: Number, required: true },
  cashSinceLastReset: { type: Number, required: true },
});

const IoTSchema = new mongoose.Schema({
  vending: vendingSchema,
  changer: changerSchema,
  coinBox: { total: { type: Number, required: true } },
  billStack: { total: { type: Number, required: true } },
  errors: errorSchema,
  transactions: transactionSchema,
});

const IoTModel = mongoose.model("IoTPacket", IoTSchema);

module.exports = IoTModel;
