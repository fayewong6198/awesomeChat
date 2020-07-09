import mongoose from "mongoose";

let Schema = mongoose.Schema;

let ChatGroupSchema = new Schema({
  name: String,
  userAmount: { type: Number, min: 1, max: 200 },
  messageAmount: { type: Number, default: 0 },
  userId: String,
  members: [
    {
      _id: false,
      userId: String,
    },
  ],
  createdAt: { type: Number, default: Date.now },
  updatedAt: { type: Number, default: Date.now },
  deletedAt: { type: Number, default: null },
});

ChatGroupSchema.statics = {
  createNew(item) {
    return this.create(item);
  },

  /**
   * get chat group items by userId and limit
   * @param {String} userId current userId
   * @param {number} limit
   */
  getChatGroups(userId, limit) {
    return this.find({
      members: { $elemMatch: { userId: userId } },
    })
      .sort({ updatedAt: -1 })
      .limit(limit)
      .exec();
  },

  getChatGroupById(id) {
    return this.findById(id).exec();
  },

  updateWhenHasNewMessage(id, newMessageAmount) {
    return this.findByIdAndUpdate(id, {
      messageAmount: newMessageAmount,
      updatedAt: Date.now(),
    }).exec();
  },

  getChatGroupIdsByUser(userId) {
    return this.find(
      {
        members: { $elemMatch: { userId: userId } },
      },
      { _id: 1 }
    ).exec();
  },

  readMoreChatGroups(userId, skip, limit) {
    return this.find({
      members: { $elemMatch: { userId: userId } },
    })
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();
  },

  updateMembers(userId, id) {
    return this.update(
      { _id: id },
      { $push: { "members.userId": userId } },
      { new: true, multi: true },
      function (error, success) {
        if (error) {
          console.log(error);
        } else {
          console.log(success);
        }
      }
    ).exec();
  },
  // updateMembers(userId, id) {
  //   var findId = this.findOne(id);
  //   findId.members.Push({"userId": userId});
  //   findId.save();
  // }
  removeMembersFromGroup(userId, id) {
    return this.update(
      { _id: id },
      { $pull: { members: Object({ userId: userId }) } },
      { new: true, multi: true }
    ).exec();
  },
};

module.exports = mongoose.model("chat-group", ChatGroupSchema);
