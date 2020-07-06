import ContactModel from "./../models/contactModel";
import UserModel from "./../models/userModel";
import _ from "lodash";
import NotificationModel from "./../models/notificationModel";

const LIMIT_NUMBER = 10;

let findUsersContact = (currentUserId, keyword) => {
  return new Promise(async (resolve, reject) => {
    let deprecatedUserIds = [currentUserId];
    let contactsByUser = await ContactModel.findAllByUser(currentUserId);
    contactsByUser.forEach((contact) => {
      deprecatedUserIds.push(contact.userId);
      deprecatedUserIds.push(contact.contactId);
    });
    deprecatedUserIds = _.uniqBy(deprecatedUserIds);
    let users = await UserModel.findAllForAddContact(deprecatedUserIds, keyword);
    resolve(users);
  });
};

let addNew = (currentUserId, contactId) => {
  return new Promise(async (resolve, reject) => {
    let contactExists = await ContactModel.checkExists(currentUserId, contactId);
    if (contactExists) {
      return reject(false);
    }
    //tạo liên hệ
    let newContactItem = {
      userId: currentUserId,
      contactId: contactId
    };
    let newContact = await ContactModel.createNew(newContactItem);

    //tạo thông báo kết bạn
    let notificationItem = {
      senderId: currentUserId,
      receiverId: contactId,
      type: NotificationModel.types.ADD_CONTACT
    };
    await NotificationModel.model.createNew(notificationItem);

    resolve(newContact);
  });
};

let removeContact = (currentUserId, contactId) => {
  return new Promise(async (resolve, reject) => {
    let removeContact = await ContactModel.removeContact(currentUserId, contactId);
    if (removeContact.result.n === 0) {
      return reject(false);
    }
    resolve(true);
  });
};

let removeRequestContactSent = (currentUserId, contactId) => {
  return new Promise(async (resolve, reject) => {
    let removeReq = await ContactModel.removeRequestContactSent(currentUserId, contactId);
    if (removeReq.result.n === 0) {
      return reject(false);
    }
    //xóa thông báo kết bạn của receiver khi sender hủy kết bạn
    let notifTypeAddContact = NotificationModel.types.ADD_CONTACT;
    await NotificationModel.model.removeRequestContactSentNotification(currentUserId, contactId, notifTypeAddContact);
    resolve(true);
  });
};

let removeRequestContactReceived = (currentUserId, contactId) => {
  return new Promise(async (resolve, reject) => {
    let removeReq = await ContactModel.removeRequestContactReceived(currentUserId, contactId);
    if (removeReq.result.n === 0) {
      return reject(false);
    }
    //xóa thông báo kết bạn của receiver khi sender hủy kết bạn (không cần thiết)
    //let notifTypeAddContact = NotificationModel.types.ADD_CONTACT;
    //await NotificationModel.model.removeRequestContactReceivedNotification(currentUserId, contactId, notifTypeAddContact);
    resolve(true);
  });
};

let approveRequestContactReceived = (currentUserId, contactId) => {
  return new Promise(async (resolve, reject) => {
    let approveReq = await ContactModel.approveRequestContactReceived(currentUserId, contactId);
    if (approveReq.nModified === 0) {
      return reject(false);
    }
    //tạo notification
    let notificationItem = {
      senderId: currentUserId,
      receiverId: contactId,
      type: NotificationModel.types.APPROVE_CONTACT
    };
    await NotificationModel.model.createNew(notificationItem);
    resolve(true);
  });
};

let getContacts = (currentUserId) => {
  return new Promise(async (resolve, reject) => {
    try {
      let contacts = await ContactModel.getContacts(currentUserId, LIMIT_NUMBER);
      let users = contacts.map(async (contact) => {
        if (contact.contactId == currentUserId) {
          return await UserModel.getNormalUserDataById(contact.userId);
        } else {
          return await UserModel.getNormalUserDataById(contact.contactId);
        }
      });
      resolve(await Promise.all(users));
    } catch (error) {
      reject(error);
    }
  });
};

let getContactsSent = (currentUserId) => {
  return new Promise(async (resolve, reject) => {
    try {
      let contacts = await ContactModel.getContactsSent(currentUserId, LIMIT_NUMBER);
      let users = contacts.map(async (contact) => {
        return await UserModel.getNormalUserDataById(contact.contactId);
      });
      resolve(await Promise.all(users));
    } catch (error) {
      reject(error);
    }
  });
};

let getContactsReceived = (currentUserId) => {
  return new Promise(async (resolve, reject) => {
    try {
      let contacts = await ContactModel.getContactsReceived(currentUserId, LIMIT_NUMBER);
      let users = contacts.map(async (contact) => {
        return await UserModel.getNormalUserDataById(contact.userId);
      });
      resolve(await Promise.all(users));
    } catch (error) {
      reject(error);
    }
  });
};

let countAllContacts = (currentUserId) => {
  return new Promise(async (resolve, reject) => {
    try {
      let count = await ContactModel.countAllContacts(currentUserId);
      resolve(count);
    } catch (error) {
      reject(error);
    }
  });
};

let countAllContactsSent = (currentUserId) => {
  return new Promise(async (resolve, reject) => {
    try {
      let count = await ContactModel.countAllContactsSent(currentUserId);
      resolve(count);
    } catch (error) {
      reject(error);
    }
  });
};

let countAllContactsReceived = (currentUserId) => {
  return new Promise(async (resolve, reject) => {
    try {
      let count = await ContactModel.countAllContactsReceived(currentUserId);
      resolve(count);
    } catch (error) {
      reject(error);
    }
  });
};

let readMoreContacts = (currentUserId, skipNumberContacts) => {
  return new Promise(async (resolve, reject) => {
    try {
      let newContacts = await ContactModel.readMoreContacts(currentUserId, skipNumberContacts, LIMIT_NUMBER);
      let users = newContacts.map(async (contact) => {
        if (contact.contactId == currentUserId) {
          return await UserModel.getNormalUserDataById(contact.userId);
        } else {
          return await UserModel.getNormalUserDataById(contact.contactId);
        }
      });
      resolve(await Promise.all(users));
    } catch (error) {
      reject(error);
    }
  });
};

let readMoreContactsSent = (currentUserId, skipNumberContacts) => {
  return new Promise(async (resolve, reject) => {
    try {
      let newContacts = await ContactModel.readMoreContactsSent(currentUserId, skipNumberContacts, LIMIT_NUMBER);
      let users = newContacts.map(async (contact) => {
        return await UserModel.getNormalUserDataById(contact.contactId);
      });
      resolve(await Promise.all(users));
    } catch (error) {
      reject(error);
    }
  });
};

let readMoreContactsReceived = (currentUserId, skipNumberContacts) => {
  return new Promise(async (resolve, reject) => {
    try {
      let newContacts = await ContactModel.readMoreContactsReceived(currentUserId, skipNumberContacts, LIMIT_NUMBER);
      let users = newContacts.map(async (contact) => {
        return await UserModel.getNormalUserDataById(contact.userId);
      });
      resolve(await Promise.all(users));
    } catch (error) {
      reject(error);
    }
  });
};

let searchFriends = (currentUserId, keyword) => {
  return new Promise(async (resolve, reject) => {
    let friendIds = [];
    let friends = await ContactModel.getFriends(currentUserId);

    friends.forEach((item) => {
      friendIds.push(item.userId);
      friendIds.push(item.contactId);
    });

    friendIds = _.uniqBy(friendIds);
    friendIds = friendIds.filter(userId => userId != currentUserId);
    let users = await UserModel.findAllToAddGroupChat(friendIds, keyword);

    resolve(users);
  });
};

module.exports = {
  findUsersContact: findUsersContact,
  addNew: addNew,
  removeContact: removeContact,
  removeRequestContactSent: removeRequestContactSent,
  removeRequestContactReceived: removeRequestContactReceived,
  getContacts: getContacts,
  getContactsSent: getContactsSent,
  getContactsReceived: getContactsReceived,
  countAllContacts: countAllContacts,
  countAllContactsSent: countAllContactsSent,
  countAllContactsReceived: countAllContactsReceived,
  readMoreContacts: readMoreContacts,
  readMoreContactsSent: readMoreContactsSent,
  readMoreContactsReceived: readMoreContactsReceived,
  approveRequestContactReceived: approveRequestContactReceived,
  searchFriends: searchFriends
};