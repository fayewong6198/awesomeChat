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
  return res.render("main/admin/chats/list", {
    url: "chat",
    users,
    auth: req.user,
  });
};

const retrieve = async (req, res, next) => {
  let messages = await Message.model.find({
    $or: [{ senderId: req.params.id }, { receiverId: req.params.id }],
  });

  let timesAgo = req.query.times || moment(Date.now()).format("YYYY-MM-DD");

  if (req.query.times) {
    messages = messages.filter((x) => {
      return moment(x.createdAt).diff(moment(timesAgo), "Day") === 0;
    });
  }

  console.log(messages);
  return res.render("main/admin/chats/retrieve", {
    url: "chat",
    messages,
    bufferToBase64,
    convertTimestampToHumanTime,
    sender: req.params.id,
    selectedDate: timesAgo || moment(Date.now()).format("YYYY-MM-DD"),
    auth: req.user,
  });
};

module.exports = {
  list,
  retrieve,
};
