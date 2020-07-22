const User = require("../../models/userModel");
const Message = require("../../models/messageModel");

import moment from "moment";
import {
  bufferToBase64,
  lastItemOfArray,
  convertTimestampToHumanTime,
} from "../../helpers/clientHelper";

const list = async (req, res, next) => {
  const users = await User.find();
  return res.render("main/admin/chats/list", { url: "chat", users });
};

const retrieve = async (req, res, next) => {
  const messages = await Message.model.find({
    $or: [{ senderId: req.params.id }, { receiverId: req.params.id }],
  });

  console.log(messages);
  return res.render("main/admin/chats/retrieve", {
    url: "chat",
    messages,
    bufferToBase64,
    convertTimestampToHumanTime,
    sender: req.params.id,
  });
};

module.exports = {
  list,
  retrieve,
};
