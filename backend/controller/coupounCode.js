// const Shop = require("../model/shop");
// const express = require("express");
// const router = express.Router();
// const ErrorHandler = require("../utils/ErrorHandler");
// const { isSeller } = require("../middleware/auth");
// const catchAsyncError = require("../middleware/catchAsyncError");
// const CoupounCode = require("../model/coupounCode");

// // CREATE A CUPON CODE FOR DISCOUNT

// router.post(
//   "/create-coupon-code",
//   isSeller,
//   catchAsyncError(async (req, resp, next) => {
//     try {
//       const isCoupounCodeExists = await CoupounCode.find({
//         name: req.body.name,
//       });

//       if (isCoupounCodeExists.length !== 0) {
//         return next(new ErrorHandler("Coupoun Code already exists!", 400));
//       }

//       const coupounCode = await CoupounCode.create(req.body);

//       resp.status(201).json({
//         success: true,
//         coupounCode,
//         message: "Coupoun Code created Successfully.",
//       });
//     } catch (error) {
//       return next(new ErrorHandler(error, 400));
//     }
//   })
// );

// module.exports = router;

const CoupounCode = require("../model/coupounCode");
const express = require("express");
const router = express.Router();
const ErrorHandler = require("../utils/ErrorHandler");
const { isSeller } = require("../middleware/auth");
const catchAsyncError = require("../middleware/catchAsyncError");

router.post(
  "/create-coupon-code",
  isSeller,
  catchAsyncError(async (req, res, next) => {
    try {
      const existing = await CoupounCode.findOne({ name: req.body.name });

      if (existing) {
        return next(new ErrorHandler("Coupon code already exists!", 400));
      }

      const coupon = await CoupounCode.create(req.body);

      res.status(201).json({
        success: true,
        coupon,
        message: "Coupon code created successfully.",
      });
    } catch (error) {
      let message = "Something went wrong";
      if (error.name === "ValidationError") {
        message = Object.values(error.errors)
          .map((e) => e.message)
          .join(", ");
      } else if (error.code === 11000) {
        message = "Duplicate key error: " + JSON.stringify(error.keyValue);
      } else if (error.message) {
        message = error.message;
      }

      return next(new ErrorHandler(message, 400));
    }
  })
);

// get all coupons of a shop
router.get(
  "/get-coupon/:id",
  isSeller,
  catchAsyncError(async (req, res, next) => {
    try {
      const coupounCode = await CoupounCode.find({
        shop: {
          _id: req.params.id,
        },
      });

      res.status(201).json({
        success: true,
        coupounCode,
      });
    } catch (error) {
      return next(new ErrorHandler(error, 400));
    }
  })
);

// delete coupon code of a shop
router.delete(
  "/delete-coupon/:id",
  isSeller,
  catchAsyncError(async (req, res, next) => {
    try {
      const couponCode = await CoupounCode.findByIdAndDelete(req.params.id);

      if (!couponCode) {
        return next(new ErrorHandler("Coupon Code dosen't exists!", 400));
      }
      res.status(201).json({
        success: true,
        message: "Coupon code deleted successfully!",
      });
    } catch (error) {
      return next(new ErrorHandler(error, 400));
    }
  })
);

// coupon code value by its name
router.get(
  "/get-coupon-value/:name",
  catchAsyncError,
  async (req, res, next) => {
    try {
      const couponCode = await CoupounCode.findOne({ name: req.params.name });

      res.status(200).json({
        success: true,
        couponCode,
      });
    } catch (error) {
      return next(new ErrorHandler(error, 400));
    }
  }
);

module.exports = router;
