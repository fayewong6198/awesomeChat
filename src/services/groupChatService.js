import _ from "lodash";
import chatGroupModel from "./../models/chatGroupModel";
import UserModel from "./../models/userModel";
import ContactModel from "./../models/contactModel";
import mongoose from "mongoose";
import { resolve, reject } from "bluebird";
import { groupChat } from ".";

let addNewGroup = (currentUserId, arrayMemberIds, groupChatName) => {
  return new Promise(async (resolve, reject) => {
    try {
      //thêm userId vào mảng array members
      arrayMemberIds.unshift({ userId: `${currentUserId}` });
      arrayMemberIds = _.uniqBy(arrayMemberIds, "userId");

      let newGroupItem = {
        name: groupChatName,
        userAmount: arrayMemberIds.length,
        userId: `${currentUserId}`,
        members: arrayMemberIds,
      };

      let newGroup = await chatGroupModel.createNew(newGroupItem);

      resolve(newGroup);
    } catch (error) {
      reject(error);
    }
  });
};

let searchMembers = (currentUserId, keyword) => {
  return new Promise(async (resolve, reject) => {
    let friendIds = [];
    let friends = await ContactModel.getFriends(currentUserId);

    friends.forEach((item) => {
      friendIds.push(item.userId);
      friendIds.push(item.contactId);
    });

    friendIds = _.uniqBy(friendIds);
    friendIds = friendIds.filter((userId) => userId != currentUserId);
    let users = await UserModel.findAllToAddGroupChat(friendIds, keyword);

    resolve(users);
  });
};

let countMember = (groupChatId) => {
  return new Promise(async (resolve, reject) => {
    let count = await chatGroupModel.countMember(groupChatId);
    console.log(count);
  });
};

let addNewMembers = (arrayMemberIds, groupChatId) => {
  return new Promise(async (resolve, reject) => {
    try {
      //thêm userId vào mảng array members
      //arrayMemberIds.unshift({userId: `${currentUserId}`});
      arrayMemberIds = _.uniqBy(arrayMemberIds, "userId");
      console.log(arrayMemberIds);
      let chatGroup = await chatGroupModel.findById(groupChatId);

      let mongooeseObjectArrayMemberIds = JSON.parse(
        JSON.stringify(chatGroup.members)
      );

      for (let i = 0; i < arrayMemberIds.length; i++) {
        console.log(i);
        mongooeseObjectArrayMemberIds.push(arrayMemberIds[i]);
      }

      mongooeseObjectArrayMemberIds = _.uniqBy(
        mongooeseObjectArrayMemberIds,
        "userId"
      );

      let newMembers = await chatGroupModel.findByIdAndUpdate(
        groupChatId,
        { members: mongooeseObjectArrayMemberIds },
        { new: true }
      );

      console.log("after update");
      resolve(newMembers);
    } catch (error) {
      reject(error);
    }
  });
};

let removeMember = (contactId, groupChatId) => {
  return new Promise(async (resolve, reject) => {
    // let count = await chatGroupModel.countMemberToDelete(groupChatId);
    // console.log(count);
    try {
      let removeMember = await chatGroupModel.removeMembersFromGroup(
        contactId,
        groupChatId
      );
      resolve(true);
    } catch (error) {
      return reject(false);
    }
  });
};

let removeGroupChat = (currentUserId, groupChatId) => {
  return new Promise(async (resolve, reject) => {
    try {
      let removeGroup = await chatGroupModel.removeGroupChatById(
        currentUserId,
        groupChatId
      );
      resolve(true);
    } catch (error) {
      return reject(false);
    }
  });
};

module.exports = {
  addNewGroup: addNewGroup,
  addNewMembers: addNewMembers,
  searchMembers: searchMembers,
  removeMember: removeMember,
  removeGroupChat: removeGroupChat,
  // countMember: countMember
};
