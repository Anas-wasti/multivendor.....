const express = require("express");
const { upload } = require("../multer");
const path = require("path");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const catchAsyncError = require("../middleware/catchAsyncError");
const sendToken = require("../utils/jwtToken");
const router = express.Router();
const User = require("../model/user");
const ErrorHandler = require("../utils/ErrorHandler");
const sendMail = require("../utils/sendMail");
const { isAuthenticated, isAdmin } = require("../middleware/auth");
const user = require("../model/user");
const { default: mongoose } = require("mongoose");

// CREATE A USER
router.post("/create-user", upload.single("file"), async (req, resp, next) => {
  try {
    console.log("REQ.BODY:", req.body);
    console.log("REQ.FILE:", req.file);
    const filename = req.file?.filename;
    console.log("upload file", filename);

    const { name, email, password } = req.body;
    const userEmail = await User.findOne({ email });

    if (userEmail) {
      const filename = req.file?.filename;

      if (filename) {
        const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${
          req.file.filename
        }`;

        try {
          // Try to delete the uploaded file
          await fs.promises.unlink(filePath);
          console.log(`✅ Deleted file: ${filename}`);
        } catch (err) {
          console.error(`⚠️ Failed to delete file (${filename}):`, err.message);
          // Optional: Don't block user creation just because of file deletion failure
        }
      } else {
        console.warn("⚠️ No file found to delete.");
      }

      return next(new ErrorHandler("User already exists", 400));
    }

    const fileUrl = path.join("uploads", req.file.filename);
    const user = {
      name,
      email,
      password,
      avatar: {
        url: fileUrl,
      },
    };

    const activationToken = createActivationToken(user);
    const activationUrl = `https://multivendor-iota-seven.vercel.app/activation/${activationToken}`;

    await sendMail({
      email: user.email,
      subject: "Activate your account",
      message: `Hello ${user.name}, please click the link to activate your account: ${activationUrl}`,
    });

    resp.status(201).json({
      success: true,
      message: `Please check your email (${user.email}) to activate your account.`,
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});

// CREATE ACTIVATION TOKEN
const createActivationToken = (user) => {
  return jwt.sign(
    {
      name: user.name,
      email: user.email,
      password: user.password,
      avatar: user.avatar,
    },
    process.env.ACTIVATION_SECRET,
    {
      expiresIn: "2h",
    }
  );
};

// ACTIVATE OUR USER

router.post(
  "/activation",
  catchAsyncError(async (req, resp, next) => {
    const { activation_token } = req.body;

    const newUser = jwt.verify(activation_token, process.env.ACTIVATION_SECRET);

    try {
      const newUser = jwt.verify(
        activation_token,
        process.env.ACTIVATION_SECRET
      );
      if (!newUser) {
        return next(new ErrorHandler("Invalid Token"));
      }
      const { name, email, password, avatar } = newUser;
      let user = await User.findOne({ email });
      if (user) {
        return next(new ErrorHandler("user already exists", 400));
      }

      user = await User.create({
        name,
        email,
        avatar,
        password,
      });
      sendToken(user, 201, resp);
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
    console.log("Decoded activation token:", newUser);
    console.log("Token received:", activation_token);
  })
);

// LOGIN USER

router.post(
  "/login-user",
  catchAsyncError(async (req, resp, next) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return next(new ErrorHandler("Please provide all feilda", 400));
      }
      const user = await User.findOne({ email }).select("+password");
      if (!user) {
        return next(new ErrorHandler("User dosn't esists!", 400));
      }
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        return next(
          new ErrorHandler("Please provide correct information", 400)
        );
      }

      sendToken(user, 201, resp);
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// LOAD USER

router.get(
  "/getuser",
  isAuthenticated,
  catchAsyncError(async (req, resp, next) => {
    try {
      const user = await User.findById(req.user._id);

      if (!user) {
        return next(new ErrorHandler("User doen't exists", 400));
      }
      resp.status(200).json({
        success: true,
        user,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// LOGOUT METHOD

router.get(
  "/logout",
  isAuthenticated,
  catchAsyncError(async (req, resp, next) => {
    try {
      resp.cookie("token", null, {
        expires: new Date(Date.now()),
        httpOnly: true,
      });
      resp.status(201).json({
        success: true,
        message: "Logout successfully",
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// update user info
router.put(
  "/update-user-info",
  isAuthenticated,
  catchAsyncError(async (req, res, next) => {
    try {
      const { name, email, phoneNumber, password } = req.body;

      // Make sure client sent the current password for verification
      if (!password) {
        return next(
          new ErrorHandler("Please provide your current password", 400)
        );
      }

      // Find the authenticated user and include password
      const user = await User.findById(req.user._id).select("+password");

      if (!user) {
        return next(new ErrorHandler("User not found", 400));
      }

      // IMPORTANT: call comparePassword on the instance, not the model
      const isPasswordValid = await user.comparePassword(password);

      // Debugging helper (uncomment if you still see errors)
      // console.log("user instance:", user);
      // console.log("has comparePassword method?:", typeof user.comparePassword);

      if (!isPasswordValid) {
        return next(
          new ErrorHandler(
            "Please provide the correct information (invalid password)",
            400
          )
        );
      }

      if (name) user.name = name;
      if (email) user.email = email;
      if (phoneNumber) user.phoneNumber = phoneNumber;

      await user.save();

      res.status(200).json({
        success: true,
        user,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// update user  avatar
router.put(
  "/update-avatar",
  isAuthenticated,
  upload.single("image"),
  catchAsyncError(async (req, res, next) => {
    try {
      const userId = req.user._id || req.user.id;
      const existsUser = await User.findById(userId);

      if (!existsUser) {
        return next(new ErrorHandler("User not found", 404));
      }

      // console.log("uploaded file:", req.file);
      // console.log("existing avatar:", existsUser.avatar);

      try {
        let prevPath = null;

        if (existsUser.avatar) {
          if (typeof existsUser.avatar === "object" && existsUser.avatar.url) {
            prevPath = path.join(__dirname, "..", existsUser.avatar.url);
          } else if (typeof existsUser.avatar === "string") {
            prevPath = path.join(__dirname, "..", existsUser.avatar);
          }
        }

        if (prevPath && fs.existsSync(prevPath)) {
          fs.unlinkSync(prevPath);
          console.log("Deleted previous avatar:", prevPath);
        } else {
          console.log(
            "No previous avatar file to delete or path not found:",
            prevPath
          );
        }
      } catch (delErr) {
        console.warn(
          "Failed to delete previous avatar (non-fatal):",
          delErr.message
        );
      }

      const uploadedFilename = req.file.filename;
      const fileRelativePath = path.join("uploads", uploadedFilename);
      const newAvatar = { url: `/${fileRelativePath}` };

      const user = await User.findByIdAndUpdate(
        userId,
        { avatar: newAvatar },
        { new: true, runValidators: true }
      ).select("-password");

      return res.status(200).json({
        success: true,
        user,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// update user address
router.put(
  "/update-user-address",
  isAuthenticated,
  catchAsyncError(async (req, res, next) => {
    try {
      const user = await User.findById(req.user.id);

      const sameTypeAddress = user.addresses.find(
        (address) => address.addressType === req.body.addressType
      );
      if (sameTypeAddress) {
        return next(
          new ErrorHandler(`${req.body.addressType} address already exists`)
        );
      }

      const existAddress = user.addresses.find(
        (address) => address._id === req.body._id
      );
      if (existAddress) {
        Object.assign(existAddress, req.body);
      } else {
        // add the new address to the array
        user.addresses.push(req.body);
      }

      await user.save();

      res.status(200).json({
        success: true,
        user,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// delete user address

router.delete(
  "/delete-user-address/:id",
  isAuthenticated,
  catchAsyncError(async (req, res, next) => {
    try {
      const userId = req.user._id;
      const addressId = req.params.id;

      // Ensure ObjectId
      if (!mongoose.Types.ObjectId.isValid(addressId)) {
        return next(new ErrorHandler("Invalid address id", 400));
      }

      await User.updateOne(
        { _id: userId },
        { $pull: { addresses: { _id: addressId } } }
      );

      const user = await User.findById(userId);
      res.status(200).json({ success: true, user });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// update user password
router.put(
  "/update-user-password",
  isAuthenticated,
  catchAsyncError(async (req, res, next) => {
    try {
      const user = await User.findById(req.user.id).select("+password");
      const isPasswordMatched = await user.comparePassword(
        req.body.oldPassword
      );

      if (!isPasswordMatched) {
        return next(new ErrorHandler("Old Password is incorrect!", 400));
      }
      if (req.body.newPassword !== req.body.confirmPassword) {
        return next(
          new ErrorHandler("Password doesn't matched with each other!", 400)
        );
      }
      user.password = req.body.newPassword;
      await user.save();
      res.status(200).json({
        success: true,
        message: "Password update successfully!",
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// find user information with the userId
router.get(
  "/user-info/:id",
  catchAsyncError(async (req, res, next) => {
    try {
      const user = await User.find(req.params.id);

      res.status(201).json({
        success: true,
        user,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// all users --- for admin
router.get(
  "/admin-all-users",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncError(async (req, res, next) => {
    try {
      const users = await User.find().sort({
        createdAt: -1,
      });

      res.status(201).json({
        success: true,
        users,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// delete user ----> admin
router.delete(
  "/delete-user/:id",
  isAuthenticated,
  isAdmin(),
  catchAsyncError(async (req, res, next) => {
    try {
      const user = await User.findById(req.params.id);

      if (!user) {
        return next(
          new ErrorHandler("User is not available with this id", 400)
        );
      }
      await User.findByIdAndDelete(req.params.id);

      res.status(201).json({
        success: true,
        message: "User daleted successfully!",
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

module.exports = router;
