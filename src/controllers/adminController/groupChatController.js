import GroupChat from "../../models/chatGroupModel";
import Message from "../../models/messageModel";
import moment from "moment";
import {
  bufferToBase64,
  lastItemOfArray,
  convertTimestampToHumanTime,
} from "../../helpers/clientHelper";
import { times } from "lodash";

// @dest admin/groupChats/
const list = async (req, res, next) => {
  const groupChats = await GroupChat.find();
  return res.render("main/admin/chatGroups/list", {
    groupChats,
    url: "groupChat",
  });
};

// @dest admin/groupChats/:id
const retrieve = async (req, res, next) => {
  try {
    const groupChat = await GroupChat.findById(req.params.id);
    if (!groupChat) {
      return res.redirect("/admin/groupChats");
    }
    let messages = await Message.model.find({ receiverId: req.params.id });

    let timesAgo = req.query.times || moment(Date.now()).format("YYYY-MM-DD");

    if (req.query.times) {
      messages = messages.filter((x) => {
        return moment(x.createdAt).diff(moment(timesAgo), "Day") === 0;
      });
    }

    return res.render("main/admin/chatGroups/retrieve", {
      messages,
      url: "groupChat",
      sender: req.query.sender,
      groupChat,
      bufferToBase64,
      convertTimestampToHumanTime,
      selectedDate: timesAgo || moment(Date.now()).format("YYYY-MM-DD"),
    });
  } catch (error) {
    console.log(error);
    return res.redirect("/admin/groupChats");
  }
};

module.exports = {
  list,
  retrieve,
};
