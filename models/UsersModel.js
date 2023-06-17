const mongoose = require("mongoose");
const UsersModel = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  phone_no: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  total_reviews: {
    type: Number,
    required: false,
    default: 0,
  },
  rating: {
    type: Number,
    required: false,
    default: 0,
  },
});
module.exports = mongoose.model("users", UsersModel);

