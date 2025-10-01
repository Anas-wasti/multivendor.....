const mongoose = require("mongoose");
require('dotenv').config()
const connectDB = () => {
  mongoose.connect('mongodb+srv://aliamish123:aliamish123@cluster0.yyjvgpg.mongodb.net/').then((data) => {
    console.log(`mongodb is connected with server ${data.connection.host}`);
  });
};

module.exports = connectDB;