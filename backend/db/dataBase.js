const mongoose = require("mongoose");
require('dotenv').config()
const connectDB = () => {
  mongoose.connect('mongodb://localhost:27017/E-Shop1').then((data) => {
    console.log(`mongodb is connected with server ${data.connection.host}`);
  });
};

module.exports = connectDB;