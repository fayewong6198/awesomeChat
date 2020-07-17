import User from "../../models/userModel";
import bcrypt from "bcrypt";
import { validationResult } from "express-validator/check";
import { permistion_choices } from "../../../utils/action_permistion";

const saltRounds = 7;

const genderChoices = {
  male: "Male",
  female: "Female",
};

const roleChoices = {
  user: "User",
  staff: "Staff",
};

// @desc GET /admin/users
// admin role
const listUser = async (req, res, next) => {
  let auth_permistions = {};
  let auth_role = req.user.role;

  for (let i = 0; i < req.user.permistions.length; i++) {
    auth_permistions[req.user.permistions[i]] = true;
  }
  const users = await User.find();

  let message = req.flash("success") || false;
  let error = req.flash("error");

  return res.render("main/admin/users/list", {
    users,
    auth_permistions,
    auth_role,
    message,
    error,
    url: "user",
  });
};

// @desc GET /admin/users/:id
// admin role
const retrieveUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.redirect("/admin/users");
    }

    let user_permistions = {};
    let auth_permistions = {};
    let auth_role = req.user.role;
    let array_permistions = user.permistions;

    for (let i = 0; i < array_permistions.length; i++) {
      user_permistions[array_permistions[i]] = true;
    }

    for (let i = 0; i < req.user.permistions.length; i++) {
      auth_permistions[req.user.permistions[i]] = true;
    }
    let message = req.flash("success") || false;
    let error = req.flash("error");
    console.log(message);
    return res.render("main/admin/users/retrieve", {
      success: true,
      msg: false,
      user,
      error,
      permistion_choices,
      user_permistions,
      auth_permistions,
      auth_role,
      message,
      className: "success",
      url: "user",
    });
  } catch (error) {
    return res.render("main/admin/users/retrieve");
  }
};

// @desc GET /admin/users/create
// admin role
const createUser = async (req, res, next) => {
  try {
    let message = req.flash("success") || false;
    let error = req.flash("error");
    console.log(message);
    return res.render("main/admin/users/create", {
      message,
      error,
      url: "user",
    });
  } catch (error) {
    return res.render("main/admin/users/create");
  }
};

// @desc POST /admin/users/create
// admin role
const postCreateUser = async (req, res, next) => {
  try {
    console.log(req.body);
    // Check validations
    let errors = validationResult(req.body);

    if (!errors.isEmpty()) {
      console.log(errors.mapped());
      ``;
      return res.render("main/admin/users/create", {
        success: false,
        msg: "some error occur",
        class: "danger",
      });
    }

    // Check user email
    let user = await User.findOne({ "local.email": req.body.email });
    console.log(user);
    if (user) {
      await req.flash("error", "Email already exits");

      return res.redirect("/admin/users/create");
    }

    user = new User(req.body);
    user.local.email = req.body.email;

    // Hash password
    let salt = bcrypt.genSaltSync(saltRounds);
    user.local.password = bcrypt.hashSync(req.body.password, salt);

    // Success
    await user.save();

    req.flash("success", "Create User Success");

    return res.redirect("/admin/users");
  } catch (error) {
    await req.flash("error", "There is some error");
    return res.redirect(`/admin/users/create`);
  }
};

// @desc POST /admin/users/update/:id
// admin role
const updateUser = async (req, res, next) => {
  try {
    console.log(req.body);
    // Check validations
    let errors = validationResult(req.body);

    if (!errors.isEmpty()) {
      console.log(errors.mapped());
      return res.render("main/admin/users/create", {
        success: false,
        msg: "some error occur",
        class: "danger",
      });
    }

    // Check user id
    let user = await User.findById(req.params.id);

    if (!user) {
      await req.flash("error", "User not found");
      return res.redirect(`/admin/users/${req.params.id}`);
    }

    if (!req.body.permistions) {
      req.body.permistions = [];
    }

    // Check change roles user
    if (
      !req.user.permistions.includes("CHANGE_ROLE") &&
      req.user.role != "admin"
    ) {
      req.body.role = user.role;
    }

    // Check change permistion user
    if (
      !req.user.permistions.includes("CHANGE_ROLE") &&
      req.user.role != "admin"
    ) {
      req.body.permistions = user.permistions;
    }

    // Update
    user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });

    user.local.email = req.body.email;
    await user.save();

    await req.flash("success", "Update user successfully");
    return res.redirect(`/admin/users/${req.params.id}`);
  } catch (error) {
    console.log(error);
    await req.flash("error", "There is some error");
    return res.redirect(`/admin/users/${req.params.id}`);
  }
};

// @desc POST /admin/users/delete/:id
// admin role
const deleteUser = async (req, res, next) => {
  try {
    let user = await User.findByIdAndDelete(req.params.id);
    await req.flash("success", "Delete user successfully");
    return res.redirect("/admin/users");
  } catch (error) {
    await req.flash("error", "There is some error");
    return res.render(`main/admin/users/${req.params.id}`);
  }
};
module.exports = {
  listUser: listUser,
  retrieveUser: retrieveUser,
  createUser: createUser,
  postCreateUser: postCreateUser,
  updateUser: updateUser,
  deleteUser: deleteUser,
};
