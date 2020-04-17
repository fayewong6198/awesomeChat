import mongoose from "mongoose";

let Schema = mongoose.Schema;

let NotificationSchema = new Schema ({
  sender: {
    id: String,
    username: String,
    avatar: String
  },
  receive: {
    id: String,
    username: String,
    avatar: String
  },
  type: String,
  content: String,
  isRead: {type: Boolean, default: false},
  file: {data: Buffer, contentType: String, fileName: String},
  createdAt: {type: Number, default: Date.now}
});

module.exports = mongoose.model("notification", NotificationSchema);

