const backup = require("backup");
var path = require("path");
const fs = require("fs");

// Database
const User = require("../../models/userModel");
const ChatGroup = require("../../models/chatGroupModel");
const Message = require("../../models/messageModel");
const Notification = require("../../models/notificationModel");
const Contact = require("../../models/contactModel");
const { notification } = require("../../services");

//
const file_system = require("fs");
const archiver = require("archiver");

const archive = archiver("zip");

const getBackUp = async (req, res, next) => {
  return res.render("main/admin/backup/backup", { url: "backup" });
};

const postBackUp = async (req, res, next) => {
  try {
    const date = Date.now();
    var output = file_system.createWriteStream(
      `${path.resolve()}/backup/awesome_chat.zip`
    );

    output.on("close", function () {
      console.log(archive.pointer() + " total bytes");
      console.log(
        "archiver has been finalized and the output file descriptor has closed."
      );
    });

    archive.on("error", function (err) {
      throw err;
    });

    archive.pipe(output);

    // append files from a sub-directory and naming it `new-subdir` within the archive (see docs for more options):
    archive.directory(path.resolve(), false);
    archive.finalize();

    return res.redirect("/admin/backup");
  } catch (error) {
    console.log(3);
    console.log(error);
    return res.redirect("/admin/backup");
  }
};

const postRestore = async (req, res, next) => {
  try {
    backup.restore(
      `${path.resolve()}/website.backup`,
      `C:/Users/Faye Wong/Desktop/backup`
    );
    console.log(2);
    return res.redirect("/admin/backup");
  } catch (error) {
    console.log(error);
    return res.redirect("/admin/backup");
  }
};

// @desc POST /admin/backup/database
const postBackupDatabase = async (req, res, next) => {
  try {
    console.log(
      `${process.env.DB_CONNECTION}://${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`
    );

    const users = await User.find();
    const chatGroups = await ChatGroup.find();
    const messages = await Message.model.find();
    const notifications = await Notification.model.find();
    const contacts = await Contact.find();
    const date = Date.now();
    fs.mkdir(
      `${path.resolve()}/backupMongoose/${date}`,
      { recursive: true },
      (err) => {
        if (err) throw err;
        fs.writeFile(
          `${path.resolve()}/backupMongoose/${date}/users.json`,
          JSON.stringify(users),
          "utf8",
          function (err) {
            if (err) throw err;
            console.log("User create successfully");
          }
        );

        fs.writeFile(
          `${path.resolve()}/backupMongoose/${date}/chat-groups.json`,
          JSON.stringify(chatGroups),
          "utf8",
          function (err) {
            if (err) throw err;
            console.log("Chat groups create successfully");
          }
        );
        fs.writeFile(
          `${path.resolve()}/backupMongoose/${date}/messages.json`,
          JSON.stringify(messages),
          "utf8",
          function (err) {
            if (err) throw err;
            console.log("Message create successfully");
          }
        );
        fs.writeFile(
          `${path.resolve()}/backupMongoose/${date}/constacts.json`,
          JSON.stringify(contacts),
          "utf8",
          function (err) {
            if (err) throw err;
            console.log("Contact create successfully");
          }
        );
        fs.writeFile(
          `${path.resolve()}/backupMongoose/${date}/notifications.json`,
          JSON.stringify(notifications),
          "utf8",
          function (err) {
            if (err) throw err;
            console.log("Notification create successfully");
          }
        );
      }
    );

    return res.redirect("/admin/backup");
  } catch (error) {
    console.log(error);
    return res.redirect("/admin/backup");
  }
};
module.exports = {
  getBackUp,
  postBackUp,
  postRestore,
  postBackupDatabase,
};
