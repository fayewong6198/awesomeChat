import ContactModel from "./../models/contactModel";
import UserModel from "./../models/userModel";
import ChatGroupModel from "./../models/chatGroupModel";
import MessageModel from "./../models/messageModel";
import _ from "lodash";
import { transErrors } from "./../../lang/vi";
import { app } from "./../config/app";
import fsExtra from "fs-extra";

const LIMIT_CONVERSATIONS_TAKEN = 15;
const LIMIT_MESSAGES_TAKEN = 30;

let getAllConversationItems = (currentUserId) => {
  return new Promise(async (resolve, reject) => {
    try {
      let contacts = await ContactModel.getContacts(
        currentUserId,
        LIMIT_CONVERSATIONS_TAKEN
      );
      let userConversationsPromise = contacts.map(async (contact) => {
        if (contact.contactId == currentUserId) {
          let getUserContact = await UserModel.getNormalUserDataById(
            contact.userId
          );
          getUserContact.updatedAt = contact.updatedAt;
          return getUserContact;
        } else {
          let getUserContact = await UserModel.getNormalUserDataById(
            contact.contactId
          );
          getUserContact.updatedAt = contact.updatedAt;
          return getUserContact;
        }
      });
      let userConversations = await Promise.all(userConversationsPromise);
      //lấy những bản ghi có currentUserId
      let groupConversations = await ChatGroupModel.getChatGroups(
        currentUserId,
        LIMIT_CONVERSATIONS_TAKEN
      );
      //Merge 2 trường thành 1 để lấy all chat
      let allConversations = userConversations.concat(groupConversations);
      allConversations = _.sortBy(allConversations, (item) => {
        return -item.updatedAt;
      });
      //lấy tin nhắn đưa vào màn hình chat
      let allConversationWithMessagesPromise = allConversations.map(
        async (conversation) => {
          conversation = conversation.toObject();
          if (conversation.members) {
            let getMessages = await MessageModel.model.getMessagesInGroup(
              conversation._id,
              LIMIT_MESSAGES_TAKEN
            );
            conversation.messages = _.reverse(getMessages);

            conversation.membersInfo = [];
            for (let member of conversation.members) {
              let userInfo = await UserModel.getNormalUserDataById(
                member.userId
              );
              conversation.membersInfo.push(userInfo);
            }
          } else {
            let getMessages = await MessageModel.model.getMessagesInPersonal(
              currentUserId,
              conversation._id,
              LIMIT_MESSAGES_TAKEN
            );
            conversation.messages = _.reverse(getMessages);
          }

          return conversation;
        }
      );
      let allConversationWithMessages = await Promise.all(
        allConversationWithMessagesPromise
      );
      //sắp xếp theo thời gian cập nhật giảm dần updatedAt
      allConversationWithMessages = _.sortBy(
        allConversationWithMessages,
        (item) => {
          return -item.updatedAt;
        }
      );

      resolve({
        allConversationWithMessages: allConversationWithMessages,
      });
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * thêm 1 tin nhắn văn bản và icon mới
 * @param {object} sender current user
 * @param {String} receiverId id of an/a user/group
 * @param {String} messageVal
 * @param {boolean} isChatGroup
 */
let addNewTextEmoji = (sender, receiverId, messageVal, isChatGroup) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (isChatGroup) {
        let getChatGroupReceiver = await ChatGroupModel.getChatGroupById(
          receiverId
        );

        if (!getChatGroupReceiver) {
          return reject(transErrors.conversation_not_found);
        }

        let receiver = {
          id: getChatGroupReceiver._id,
          name: getChatGroupReceiver.name,
          avatar: app.general_avatar_group_chat, // config/app.js
        };

        let newMessageItem = {
          senderId: sender.id,
          receiverId: receiver.id,
          conversationType: MessageModel.conversationTypes.GROUP,
          messageType: MessageModel.messageTypes.TEXT,
          sender: sender,
          receiver: receiver,
          text: messageVal,
          createdAt: Date.now(),
        };
        //tạo tin nhắn mới trong cuộc trò chuyện
        let newMessage = await MessageModel.model.createNew(newMessageItem);
        //đưa cuộc trò chuyện lên vị trí index = 0 leftside
        await ChatGroupModel.updateWhenHasNewMessage(
          getChatGroupReceiver._id,
          getChatGroupReceiver.messageAmount + 1
        );
        resolve(newMessage);
      } else {
        let getUserReceiver = await UserModel.getNormalUserDataById(receiverId);

        if (!getUserReceiver) {
          return reject(transErrors.conversation_not_found);
        }

        let receiver = {
          id: getUserReceiver._id,
          name: getUserReceiver.username,
          avatar: getUserReceiver.avatar, // config/app.js
        };

        let newMessageItem = {
          senderId: sender.id,
          receiverId: receiver.id,
          conversationType: MessageModel.conversationTypes.PERSONAL,
          messageType: MessageModel.messageTypes.TEXT,
          sender: sender,
          receiver: receiver,
          text: messageVal,
          createdAt: Date.now(),
        };
        //tạo tin nhắn mới
        let newMessage = await MessageModel.model.createNew(newMessageItem);
        //cập nhật liên hệ contact
        await ContactModel.updateWhenHasNewMessage(
          sender.id,
          getUserReceiver._id
        );
        resolve(newMessage);
      }
    } catch (error) {
      reject(error);
    }
  });
};

let removeTextEmoji = (sender, receiverId, messageId, isChatGroup) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (isChatGroup == "true") {
        console.log("Chat group ", isChatGroup);
        console.log(1);
        let getChatGroupReceiver = await ChatGroupModel.getChatGroupById(
          receiverId
        );
        console.log(2);
        if (!getChatGroupReceiver) {
          return reject(transErrors.conversation_not_found);
        }
        console.log(3);
        console.log("cc");
        // xóa tin nhắn
        let message = await MessageModel.model.getMessageById(messageId);
        console.log("cc");
        if (!message) {
          console.log("messaggeID: ", messageId);
          console.log("message not found");
          return reject("Message not found");
        }
        console.log(4);
        message = await MessageModel.model.getMessageByIdAndUpdate(messageId, {
          deletedAt: new Date(),
        });
        //đưa cuộc trò chuyện lên vị trí index = 0 leftside
        await ChatGroupModel.updateWhenHasNewMessage(
          getChatGroupReceiver._id,
          getChatGroupReceiver.messageAmount - 1
        );
        console.log(5);
        resolve(message);
      } else {
        console.log("Not group");
        console.log(isChatGroup);
        let getUserReceiver = await UserModel.getNormalUserDataById(receiverId);

        if (!getUserReceiver) {
          return reject(transErrors.conversation_not_found);
        }

        // xóa tin nhắn
        let message = await MessageModel.model.findById(messageId);
        if (!message) {
          return reject("Message not found");
        }

        message = await MessageModel.model.findByIdAndUpdate(messageId, {
          deletedAt: new Date(),
        });
        await ContactModel.updateWhenHasNewMessage(
          sender.id,
          getUserReceiver._id
        );
        resolve(message);
      }
    } catch (error) {
      console.log(error);
      reject(error);
    }
  });
};

let restoreTextEmoji = (sender, receiverId, messageId, isChatGroup) => {
  return new Promise(async (resolve, reject) => {
    console.log("go in to restore");
    console.log("chat group ", isChatGroup);
    console.log(isChatGroup);
    try {
      if (isChatGroup == "true") {
        console.log("is chat group is true");
        let getChatGroupReceiver = await ChatGroupModel.getChatGroupById(
          receiverId
        );

        if (!getChatGroupReceiver) {
          return reject(transErrors.conversation_not_found);
        }

        let message = await MessageModel.model.getMessageById(messageId);

        if (!message) {
          console.log("messaggeID: ", messageId);
          console.log("message not found");
          return reject("Message not found");
        }

        message = await MessageModel.model.getMessageByIdAndUpdate(messageId, {
          deletedAt: null,
        });
        //đưa cuộc trò chuyện lên vị trí index = 0 leftside
        await ChatGroupModel.updateWhenHasNewMessage(
          getChatGroupReceiver._id,
          getChatGroupReceiver.messageAmount - 1
        );

        resolve(message);
      } else {
        console.log("is chat group is false");
        let getUserReceiver = await UserModel.getNormalUserDataById(receiverId);

        if (!getUserReceiver) {
          return reject(transErrors.conversation_not_found);
        }

        // update message
        let message = await MessageModel.model.findById(messageId);
        if (!message) {
          return reject("Message not found");
        }

        message = await MessageModel.model.findByIdAndUpdate(messageId, {
          deletedAt: null,
        });
        await ContactModel.updateWhenHasNewMessage(
          sender.id,
          getUserReceiver._id
        );
        resolve(message);
      }
    } catch (error) {
      console.log(error);
      reject(error);
    }
  });
};

/**
 * thêm 1 tin nhắn hình ảnh
 * @param {object} sender current user
 * @param {String} receiverId id of an/a user/group
 * @param {file} messageVal
 * @param {boolean} isChatGroup
 */
let addNewImage = (sender, receiverId, messageVal, isChatGroup) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (isChatGroup) {
        let getChatGroupReceiver = await ChatGroupModel.getChatGroupById(
          receiverId
        );

        if (!getChatGroupReceiver) {
          return reject(transErrors.conversation_not_found);
        }

        let receiver = {
          id: getChatGroupReceiver._id,
          name: getChatGroupReceiver.name,
          avatar: app.general_avatar_group_chat, // config/app.js
        };

        let imageBuffer = await fsExtra.readFile(messageVal.path);
        let imageContentType = messageVal.mimetype;
        let imageName = messageVal.originalname;

        let newMessageItem = {
          senderId: sender.id,
          receiverId: receiver.id,
          conversationType: MessageModel.conversationTypes.GROUP,
          messageType: MessageModel.messageTypes.IMAGE,
          sender: sender,
          receiver: receiver,
          file: {
            data: imageBuffer,
            contentType: imageContentType,
            fileName: imageName,
          },
          createdAt: Date.now(),
        };
        //tạo tin nhắn mới trong cuộc trò chuyện
        let newMessage = await MessageModel.model.createNew(newMessageItem);
        //đưa cuộc trò chuyện lên vị trí index = 0 leftside
        await ChatGroupModel.updateWhenHasNewMessage(
          getChatGroupReceiver._id,
          getChatGroupReceiver.messageAmount + 1
        );
        resolve(newMessage);
      } else {
        let getUserReceiver = await UserModel.getNormalUserDataById(receiverId);
        if (!getUserReceiver) {
          return reject(transErrors.conversation_not_found);
        }

        let receiver = {
          id: getUserReceiver._id,
          name: getUserReceiver.username,
          avatar: getUserReceiver.avatar, // config/app.js
        };

        let imageBuffer = await fsExtra.readFile(messageVal.path);
        let imageContentType = messageVal.mimetype;
        let imageName = messageVal.originalname;

        let newMessageItem = {
          senderId: sender.id,
          receiverId: receiver.id,
          conversationType: MessageModel.conversationTypes.PERSONAL,
          messageType: MessageModel.messageTypes.IMAGE,
          sender: sender,
          receiver: receiver,
          file: {
            data: imageBuffer,
            contentType: imageContentType,
            fileName: imageName,
          },
          createdAt: Date.now(),
        };
        //tạo tin nhắn mới
        let newMessage = await MessageModel.model.createNew(newMessageItem);
        //cập nhật liên hệ contact
        await ContactModel.updateWhenHasNewMessage(
          sender.id,
          getUserReceiver._id
        );
        resolve(newMessage);
      }
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * thêm 1 tin nhắn tệp tin
 * @param {object} sender current user
 * @param {String} receiverId id of an/a user/group
 * @param {file} messageVal
 * @param {boolean} isChatGroup
 */
let addNewAttachment = (sender, receiverId, messageVal, isChatGroup) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (isChatGroup) {
        let getChatGroupReceiver = await ChatGroupModel.getChatGroupById(
          receiverId
        );

        if (!getChatGroupReceiver) {
          return reject(transErrors.conversation_not_found);
        }

        let receiver = {
          id: getChatGroupReceiver._id,
          name: getChatGroupReceiver.name,
          avatar: app.general_avatar_group_chat, // config/app.js
        };

        let attachmentBuffer = await fsExtra.readFile(messageVal.path);
        let attachmentContentType = messageVal.mimetype;
        let attachmentName = messageVal.originalname;

        let newMessageItem = {
          senderId: sender.id,
          receiverId: receiver.id,
          conversationType: MessageModel.conversationTypes.GROUP,
          messageType: MessageModel.messageTypes.FILE,
          sender: sender,
          receiver: receiver,
          file: {
            data: attachmentBuffer,
            contentType: attachmentContentType,
            fileName: attachmentName,
          },
          createdAt: Date.now(),
        };
        //tạo tin nhắn mới trong cuộc trò chuyện
        let newMessage = await MessageModel.model.createNew(newMessageItem);
        //đưa cuộc trò chuyện lên vị trí index = 0 leftside
        await ChatGroupModel.updateWhenHasNewMessage(
          getChatGroupReceiver._id,
          getChatGroupReceiver.messageAmount + 1
        );
        resolve(newMessage);
      } else {
        let getUserReceiver = await UserModel.getNormalUserDataById(receiverId);
        if (!getUserReceiver) {
          return reject(transErrors.conversation_not_found);
        }

        let receiver = {
          id: getUserReceiver._id,
          name: getUserReceiver.username,
          avatar: getUserReceiver.avatar, // config/app.js
        };

        let attachmentBuffer = await fsExtra.readFile(messageVal.path);
        let attachmentContentType = messageVal.mimetype;
        let attachmentName = messageVal.originalname;

        let newMessageItem = {
          senderId: sender.id,
          receiverId: receiver.id,
          conversationType: MessageModel.conversationTypes.PERSONAL,
          messageType: MessageModel.messageTypes.FILE,
          sender: sender,
          receiver: receiver,
          file: {
            data: attachmentBuffer,
            contentType: attachmentContentType,
            fileName: attachmentName,
          },
          createdAt: Date.now(),
        };
        //tạo tin nhắn mới
        let newMessage = await MessageModel.model.createNew(newMessageItem);
        //cập nhật liên hệ contact
        await ContactModel.updateWhenHasNewMessage(
          sender.id,
          getUserReceiver._id
        );
        resolve(newMessage);
      }
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * read more conversation leftSide.js
 * @param {string} currentUserId
 * @param {number} skipPersonal
 * @param {number} skipGroup
 */
let readMoreAllChat = (currentUserId, skipPersonal, skipGroup) => {
  return new Promise(async (resolve, reject) => {
    try {
      let contacts = await ContactModel.readMoreContacts(
        currentUserId,
        skipPersonal,
        LIMIT_CONVERSATIONS_TAKEN
      );
      let userConversationsPromise = contacts.map(async (contact) => {
        if (contact.contactId == currentUserId) {
          let getUserContact = await UserModel.getNormalUserDataById(
            contact.userId
          );
          getUserContact.updatedAt = contact.updatedAt;
          return getUserContact;
        } else {
          let getUserContact = await UserModel.getNormalUserDataById(
            contact.contactId
          );
          getUserContact.updatedAt = contact.updatedAt;
          return getUserContact;
        }
      });
      let userConversations = await Promise.all(userConversationsPromise);

      //lấy những bản ghi có currentUserId
      let groupConversations = await ChatGroupModel.readMoreChatGroups(
        currentUserId,
        skipGroup,
        LIMIT_CONVERSATIONS_TAKEN
      );
      //Merge 2 trường thành 1 để lấy all chat
      let allConversations = userConversations.concat(groupConversations);
      allConversations = _.sortBy(allConversations, (item) => {
        return -item.updatedAt;
      });
      //lấy tin nhắn đưa vào màn hình chat
      let allConversationWithMessagesPromise = allConversations.map(
        async (conversation) => {
          conversation = conversation.toObject();
          if (conversation.members) {
            let getMessages = await MessageModel.model.getMessagesInGroup(
              conversation._id,
              LIMIT_MESSAGES_TAKEN
            );
            conversation.messages = _.reverse(getMessages);
          } else {
            let getMessages = await MessageModel.model.getMessagesInPersonal(
              currentUserId,
              conversation._id,
              LIMIT_MESSAGES_TAKEN
            );
            conversation.messages = _.reverse(getMessages);
          }

          return conversation;
        }
      );
      let allConversationWithMessages = await Promise.all(
        allConversationWithMessagesPromise
      );
      //sắp xếp theo thời gian cập nhật giảm dần updatedAt
      allConversationWithMessages = _.sortBy(
        allConversationWithMessages,
        (item) => {
          return -item.updatedAt;
        }
      );

      resolve(allConversationWithMessages);
    } catch (error) {
      reject(error);
    }
  });
};

/**
 *
 * @param {string} currentUserId
 * @param {number} skipMessage
 * @param {string} targetId
 * @param {boolean} chatInGroup
 */
let readMore = (currentUserId, skipMessage, targetId, chatInGroup) => {
  return new Promise(async (resolve, reject) => {
    try {
      //message in group
      if (chatInGroup) {
        let getMessages = await MessageModel.model.readMoreMessagesInGroup(
          targetId,
          skipMessage,
          LIMIT_MESSAGES_TAKEN
        );
        getMessages = _.reverse(getMessages); //đảo ngược mảng
        return resolve(getMessages);
      }

      //message in personal
      let getMessages = await MessageModel.model.readMoreMessagesInPersonal(
        currentUserId,
        targetId,
        skipMessage,
        LIMIT_MESSAGES_TAKEN
      );
      getMessages = _.reverse(getMessages);
      return resolve(getMessages);
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = {
  getAllConversationItems: getAllConversationItems,
  addNewTextEmoji: addNewTextEmoji,
  addNewImage: addNewImage,
  addNewAttachment: addNewAttachment,
  readMoreAllChat: readMoreAllChat,
  readMore: readMore,
  removeTextEmoji: removeTextEmoji,
  restoreTextEmoji: restoreTextEmoji,
};
