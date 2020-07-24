import { validationResult } from "express-validator/check";
import { groupChat, contact } from "./../services/index";
import Notification from "../models/notificationModel";
import { resolve } from "bluebird";
const mongoose = require("mongoose");
import _ from "lodash";
let addNewGroup = async (req, res) => {
  let errorsArr = [];
  let validationErrors = validationResult(req);
  if (!validationErrors.isEmpty()) {
    let errors = Object.values(validationErrors.mapped());
    errors.forEach((item) => {
      errorsArr.push(item.msg);
    });
    return res.status(500).send(errorsArr);
  }

  try {
    let currentUserId = req.user._id;
    let arrayMemberIds = req.body.arrayIds;
    let groupChatName = req.body.groupChatName;

    let newGroupChat = await groupChat.addNewGroup(
      currentUserId,
      arrayMemberIds,
      groupChatName
    );

    return res.status(200).send({ groupChat: newGroupChat });
  } catch (error) {
    return res.status(500).send(error);
  }
};

let addNewMembers = async (req, res) => {
  let errorsArr = [];
  let validationErrors = validationResult(req);
  if (!validationErrors.isEmpty()) {
    let errors = Object.values(validationErrors.mapped());
    errors.forEach((item) => {
      errorsArr.push(item.msg);
    });
    return res.status(500).send(errorsArr);
  }

  try {
    let currentUserId = req.user._id;
    let arrayMemberIds = req.body.arrayIds;
    let groupChatId = req.body.groupChatId;

    let addNewMembers = await groupChat.addNewMembers(
      arrayMemberIds,
      groupChatId
    );
    console.log("sadasdasdalskdasjdlkasjdlkjdaslj");
    console.log(req.body.arrayIds);
    let newArrayMemberIds = _.uniqBy(req.body.arrayIds, "userId");
    console.log(newArrayMemberIds);
    console.log(1);
    let notificationItems = [];
    console.log(2);
    for (let i = 0; i < newArrayMemberIds.length; i++) {
      console.log(3, i);
      let notificationItem = {
        senderId: req.user._id,
        receiverId: mongoose.Types.ObjectId(newArrayMemberIds[i].userId),
        type: "ADD_TO_GROUP",
      };
      notificationItems.push(notificationItem);
      console.log(4, i);
    }
    console.log("dit me nay", notificationItems);
    await Notification.model.create(notificationItems);
    console.log(5);
    //tạo thông báo add to group group chat

    console.log(req.user._id);

    console.log("create add to group notification success");

    return res.status(200).send({ groupChat: addNewMembers });
  } catch (error) {
    return res.status(500).send(error);
  }
};

let searchMembers = async (req, res) => {
  let errorsArr = [];
  let validationErrors = validationResult(req);
  if (!validationErrors.isEmpty()) {
    let errors = Object.values(validationErrors.mapped());
    errors.forEach((item) => {
      errorsArr.push(item.msg);
    });
    return res.status(500).send(errorsArr);
  }

  try {
    let currentUserId = req.user._id;
    let keyword = req.params.keyword;
    let users = await groupChat.searchMembers(currentUserId, keyword);
    return res.render("main/newMembersGroup/sections/_searchMembers", {
      users,
    });
  } catch (error) {
    return res.status(500).send(error);
  }
};

let removeMember = async (req, res) => {
  try {
    let contactId = req.body.uid;
    let groupChatId = req.body.groupChatId;
    let removeMember = await groupChat.removeMember(contactId, groupChatId);

    //tạo thông báo remove khoi group chat
    let notificationItem = {
      senderId: req.user._id,
      receiverId: contactId,
      type: "REMOVE_FROM_GROUP",
    };

    console.log(req.user._id);
    await Notification.model.create(notificationItem);
    console.log("create remove from group notification success");
    return res.status(200).send({ success: !!removeMember });
  } catch (error) {
    return res.status(500).send(error);
  }
};

let removeGroupChat = async (req, res) => {
  try {
    let userId = req.user._id;
    let groupChatId = req.body.groupChatId;
    let removeGroup = await groupChat.removeGroupChat(userId, groupChatId);

    return res.status(200).send({ success: !!removeGroup });
  } catch (error) {
    return res.status(500).send(error);
  }
};

module.exports = {
  addNewGroup: addNewGroup,
  addNewMembers: addNewMembers,
  searchMembers: searchMembers,
  removeMember: removeMember,
  removeGroupChat: removeGroupChat,
};
