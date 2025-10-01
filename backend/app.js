const express = require("express");
const ErrorHandler = require("./middleware/error");
const app = express();
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");

require("dotenv").config({
  path: path.join("backend/config/.env"),
});
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "https://multivendor-iota-seven.vercel.app/",
    credentials: true,
  })
);
app.use("/", express.static("uploads"));
app.use("/", (req, res) => {
  res.send("Hello world!");
});
app.use(bodyParser.urlencoded({ extended: true }));

// CONFIG
if (process.env.NODE_ENV !== "PRODUCTION") {
  require("dotenv").config({
    path: "config/.env",
  });
}

// IMPORTS ROUTES
const user = require("./controller/user");
const shop = require("./controller/shop");
const product = require("./controller/product");
const event = require("./controller/event");
const coupon = require("./controller/coupounCode");
const payment = require("./controller/payment");
const order = require("./controller/order");
const conversation = require("./controller/conversation");
const messages = require("./controller/messages");
const withdraw = require("./controller/withdraw");

app.use("/api/v2/user", user);
app.use("/api/v2/conversation", conversation);
app.use("/api/v2/messages", messages);
app.use("/api/v2/shop", shop);
app.use("/api/v2/product", product);
app.use("/api/v2/event", event);
app.use("/api/v2/coupon", coupon);
app.use("/api/v2/payment", payment);
app.use("/api/v2/order", order);
app.use("/api/v2/withdraw", withdraw);

//  FOR ERROR HANDLING
app.use(ErrorHandler);
module.exports = app;
