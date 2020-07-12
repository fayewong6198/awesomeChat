import mongoose from "mongoose";

let Schema = mongoose.Schema;

let ChatGroupMemberSchema = new Schema ({
  user: {
      type: mongoose.Types.ObjectId,
      ref = 'user'
  },
  chatGroup: {
        type: mongoose.Types.ObjectId,
        ref: 'chat-group'
  },
  
  createdAt: {type: Number, default: Date.now},
  updatedAt: {type: Number, default: null},
  deletedAt: {type: Number, default: null}
});

ChatGroupMemberSchema.statics = {
}


module.exports = {
  model: mongoose.model("chatGroupMember", ChatGroupMemberSchema),
  conversationTypes: MESSAGE_CONVERSATION_TYPES,
  messageTypes: MESSAGE_TYPES
};



