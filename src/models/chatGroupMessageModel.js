import mongoose from "mongoose";

let Schema = mongoose.Schema;

let ChatGroupMessage = new Schema({
  user: {
    type: mongoose.Types.ObjectId,
    ref: "user",
  },
  conversationType: String,
  messageType: String,
  text: String,
  file: { data: Buffer, contentType: String, fileName: String },
  createdAt: { type: Number, default: Date.now },
  updatedAt: { type: Number, default: null },
  deletedAt: { type: Number, default: null },
});

ChatGroupMessage.statics = {
  /**
   * tạo mới tin nhắn
   * @param {object} item
   */
  createNew(item) {
    return this.create(item);
  },

  /**
   * Lấy tin nhắn cuộc trò chuyện cá nhân
   * @param {String} senderId currentUserId
   * @param {String} receiverId id personal
   * @param {Number} limit
   */
  getMessagesInPersonal(senderId, receiverId, limit) {
    return this.find({
      $or: [
        { $and: [{ senderId: senderId }, { receiverId: receiverId }] },
        { $and: [{ receiverId: senderId }, { senderId: receiverId }] },
      ],
    })
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  },

  /**
   * Lấy tin nhắn cuộc trò chuyện nhóm
   * @param {String} receiverId groupChat's id
   * @param {Number} limit
   */
  getMessagesInGroup(receiverId, limit) {
    return this.find({ receiverId: receiverId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  },

  readMoreMessagesInPersonal(senderId, receiverId, skip, limit) {
    return this.find({
      $or: [
        { $and: [{ senderId: senderId }, { receiverId: receiverId }] },
        { $and: [{ receiverId: senderId }, { senderId: receiverId }] },
      ],
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();
  },

  readMoreMessagesInGroup(receiverId, skip, limit) {
    return this.find({ receiverId: receiverId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();
  },
};

const MESSAGE_CONVERSATION_TYPES = {
  PERSONAL: "personal",
  GROUP: "group",
};

const MESSAGE_TYPES = {
  TEXT: "text",
  IMAGE: "image",
  FILE: "file",
};

module.exports = {
  model: mongoose.model("chatGroupMessage", ChatGroupMessage),
  conversationTypes: MESSAGE_CONVERSATION_TYPES,
  messageTypes: MESSAGE_TYPES,
};
