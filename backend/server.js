const app = require("./app");
const connectDB = require("./db/dataBase");
const cloudinary = require("cloudinary");

require("dotenv").config({
  path: "backend/config/.env",
});
const express = require("express");
const path = require("path");
app.use("/uploads", express.static(path.join(__dirname, "./uploads")));

// HANDLING UNCAUGHT EXCEPTIONS

process.on("uncaughtException", (err) => {
  console.log(`Error, ${err.message}`);
  console.log(`shuting down the server for handling uncaught exception`);
});

// CONFIG
if (process.env.NODE_ENV !== "PRODUCTION") {
  require("dotenv").config({
    path: "config/.env",
  });
}
// CONNECT DB
connectDB();
// CREATE SERVER

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

const server = app.listen(process.env.PORT, () => {
  console.log(`server is runig on http://localhost:${process.env.PORT}`);
});

// UNHANDLE PROMISE REJECTION
process.on("unhandledRejection", (err) => {
  console.log(`shutting down the server for  ${err.message}`);
  console.log(`shutting down the server for Unhandled Promise Rejection`);
  server.close(() => {
    process.exit(1);
  });
});
