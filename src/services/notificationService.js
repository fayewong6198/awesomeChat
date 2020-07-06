import NotificationModel from "./../models/notificationModel";
import UserModel from "./../models/userModel";
import { resolve, reject } from "bluebird";

const LIMIT_NUMBER = 10;
let getNotifications = (currentUserId) => {
  return new Promise(async (resolve, reject) => {
    try {
      let notifications = await NotificationModel.model.getByUserIdAndLimit(currentUserId, LIMIT_NUMBER);
      let getNotifContents = notifications.map(async (notification) => {
        let sender = await UserModel.getNormalUserDataById(notification.senderId);
        return NotificationModel.contents.getContent(notification.type, notification.isRead, sender._id, sender.username, sender.avatar);
      });
      resolve(await Promise.all(getNotifContents));
    } catch (error) {
      reject(error)
    }
  });
};

/**
 * Đếm số thông báo chưa đọc
 * @param {String} currentUserId 
 */
let countNotifUnread = (currentUserId) => {
  return new Promise(async (resolve, reject) => {
    try {
      let notificationsUnread = await NotificationModel.model.countNotifUnread(currentUserId);
      resolve(notificationsUnread);
    } catch (error) {
      reject(error)
    }
  });
};

/**
 * Đọc thêm 10 tin nhắn cũ
 * @param {String} currentUserId 
 * @param {number} skipNumberNotification 
 */
let readMore = (currentUserId, skipNumberNotification) => {
  return new Promise(async (resolve, reject) => {
    try {
      let newNotifications = await NotificationModel.model.readMore(currentUserId, skipNumberNotification, LIMIT_NUMBER);
      let getNotifContents = newNotifications.map(async (notification) => {
        let sender = await UserModel.getNormalUserDataById(notification.senderId);
        return NotificationModel.contents.getContent(notification.type, notification.isRead, sender._id, sender.username, sender.avatar);
      });
      resolve(await Promise.all(getNotifContents));
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Đánh dấu các thông báo là đã đọc
 * @param {string} currentUserId 
 * @param {array} targetUsers 
 */
let markAllAsRead = (currentUserId, targetUsers) => {
  return new Promise(async (resolve, reject) => {
    try {
      await NotificationModel.model.markAllAsRead(currentUserId, targetUsers);
      resolve(true);
    } catch (error) {
      console.log(`Error when mark notifications as read: ${error}`);
      reject(false);
    }
  });
};

module.exports = {
  getNotifications: getNotifications,
  countNotifUnread: countNotifUnread,
  readMore: readMore,
  markAllAsRead: markAllAsRead
};