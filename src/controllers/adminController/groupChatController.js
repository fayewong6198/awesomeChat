import GroupChat from "../../models/chatGroupModel";
import Message from "../../models/messageModel";
import {
  bufferToBase64,
  lastItemOfArray,
  convertTimestampToHumanTime,
} from "../../helpers/clientHelper";

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
      console.log("Group chat not found");
      return res.redirect("/admin/groupChats");
    }
    const messages = await Message.model.find({ receiverId: req.params.id });

    return res.render("main/admin/chatGroups/retrieve", {
      messages,
      url: "groupChat",
      sender: req.query.sender,
      groupChat,
      bufferToBase64,
      convertTimestampToHumanTime,
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
