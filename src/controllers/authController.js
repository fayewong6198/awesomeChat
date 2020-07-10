import { validationResult } from "express-validator/check";
import { auth } from "./../services/index";
import { transSuccess } from "./../../lang/vi";
import User from "../models/userModel";
import crypto from "crypto";
import bcrypt from "bcrypt";
import sendEmail from "../../utils/sendEmail";

let saltRounds = 7;

let getLoginRegister = (req, res) => {
  return res.render("auth/master", {
    errors: req.flash("errors"),
    success: req.flash("success"),
  });
};

let postRegister = async (req, res) => {
  let errorsArr = [];
  let successArr = [];
  let validationErrors = validationResult(req);
  if (!validationErrors.isEmpty()) {
    let errors = Object.values(validationErrors.mapped());
    errors.forEach((item) => {
      errorsArr.push(item.msg);
    });
    req.flash("errors", errorsArr);
    return res.redirect("/login-register");
  }

  try {
    let createUserSuccess = await auth.register(
      req.body.email,
      req.body.gender,
      req.body.password,
      req.protocol,
      req.get("host")
    );
    successArr.push(createUserSuccess);
    req.flash("success", successArr);
    return res.redirect("/login-register");
  } catch (error) {
    errorsArr.push(error);
    req.flash("errors", errorsArr);
    return res.redirect("/login-register");
  }
};

let verifyAccount = async (req, res) => {
  let errorsArr = [];
  let successArr = [];
  try {
    let verifySuccess = await auth.verifyAccount(req.params.token);
    successArr.push(verifySuccess);

    req.flash("success", successArr);
    return res.redirect("/login-register");
  } catch (error) {
    errorsArr.push(error);
    req.flash("errors", errorsArr);
    return res.redirect("/login-register");
  }
};

let getLogout = (req, res) => {
  req.logout(); //xoa session passport user
  req.flash("success", transSuccess.logout_success);
  return res.redirect("/login-register");
};

let checkLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.redirect("/login-register");
  }
  next();
};

let checkLoggedOut = (req, res, next) => {
  if (req.isAuthenticated()) {
    return res.redirect("/");
  }
  next();
};

// Reset Password

// @desc /reset-password
let getResetPassword = (req, res, next) => {
  console.log("reset password");
  return res.render("auth/resetPassword/resetPassword");
};

let postResetPassword = async (req, res, next) => {
  try {
    let user = await User.findOne({ "local.email": req.body.email });

    if (!user) {
      return res.redirect("/reset-password");
    }

    const resetPasswordToken = crypto.randomBytes(48).toString("hex");

    console.log(resetPasswordToken);

    user = await User.findByIdAndUpdate(user._id, {
      resetPasswordToken: resetPasswordToken,
    });

    let linkVerify = `localhost:8017/reset-password/${resetPasswordToken}`;
    //send mail
    const message = `Click on the link below to reset your password: \n\n ${linkVerify}`;
    try {
      await sendEmail({
        email: req.body.email,
        subject: "CONFIRM EMAIL",
        message,
      });
    } catch (error) {
      return res.render("auth/resetPassword/emailSent", {
        success: false,
        msg: "We couldn't sent email. Please do again",
      });
    }

    return res.render("auth/resetPassword/emailSent", {
      success: true,
      msg: "Email sent success, Please check your email",
    });
  } catch (error) {
    return res.render("auth/resetPassword/emailSent", {
      success: false,
      msg: "We couldn't sent email. Please do again",
    });
  }
};

// @decs GET: reset-password/:token
let confirmEmail = async (req, res, next) => {
  try {
    let token = req.params.token;
    console.log(token);
    let user = await User.findOne({ resetPasswordToken: token });
    console.log(user);
    if (!user) {
      return res.render("auth/resetPassword/emailSent", {
        success: false,
        msg: `User not found with token ${token}`,
      });
    }

    return res.render("auth/resetPassword/resetPasswordForm", {
      email: user.local.email,
      token: token,
    });
  } catch (error) {
    return res.render("auth/resetPassword/emailSent", {
      success: false,
      msg: `Their is some error, please try again`,
    });
  }
};

// @decs POST: reset-password/:token
let createNewPassword = async (req, res, next) => {
  let token = req.params.token;
  console.log(token);
  let user = await User.findOne({ resetPasswordToken: token });
  console.log(user);
  if (!user) {
    return res.render("auth/resetPassword/emailSent", {
      success: false,
      msg: `User not found with token ${token}`,
    });
  }
  let salt = bcrypt.genSaltSync(saltRounds);

  let resetedPassword = bcrypt.hashSync(req.body.password, salt);

  // Update password
  console.log(user);
  user = await User.findByIdAndUpdate(user._id, {
    resetPasswordToken: null,
    "local.password": resetedPassword,
  });

  req.flash("success", transSuccess.reset_password_success);

  return res.redirect("/");
};

module.exports = {
  getLoginRegister: getLoginRegister,
  postRegister: postRegister,
  verifyAccount: verifyAccount,
  getLogout: getLogout,
  checkLoggedIn: checkLoggedIn,
  checkLoggedOut: checkLoggedOut,
  getResetPassword: getResetPassword,
  postResetPassword: postResetPassword,
  confirmEmail: confirmEmail,
  createNewPassword: createNewPassword,
};
