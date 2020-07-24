import moment from "moment";

const backup = require("backup");
const path = require("path");
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

const convertDate = (milisecond) => {
  let date = new Date(parseInt(milisecond)).toLocaleString();
  return date;
};

const getBackUp = async (req, res, next) => {
  let message = req.flash("success") || false;
  let error = req.flash("error");
  const backupMongooseVersions = fs.readdirSync(
    `${path.resolve()}/src/backupMongoose/`
  );

  return res.render("main/admin/backup/backup", {
    url: "backup",
    auth: req.user,
    message,
    error,
    backupMongooseVersions,
    convertDate,
  });
};

const postBackUp = async (req, res, next) => {
  try {
    const date = Date.now();
    fs.mkdir(`${path.resolve()}/src/backup/`, { recursive: true }, (err) => {
      if (err) throw err;
      const output = file_system.createWriteStream(
        `${path.resolve()}/src/backup/awesome_chat.zip`
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
    });
    await req.flash("success", "Backup Sucessfull");
    return res.redirect("/admin/backup");
  } catch (error) {
    await req.flash("success", "Backup Error Sucessfull");
    console.log(error);
    return res.redirect("/admin/backup");
  }
};

//@desc admin/restore
// RESTORE DATABASE
const postRestore = async (req, res, next) => {
  console.log("go to restore");
  try {
    const version = req.body.version;
    // User
    const users = JSON.parse(
      fs.readFileSync(
        `${path.resolve()}/src/backupMongoose/${version}/users.json`
      )
    );
    await User.remove({});
    await User.create(users);
    console.log("Restore user success");

    // Message
    const messages = JSON.parse(
      fs.readFileSync(
        `${path.resolve()}/src/backupMongoose/${version}/messages.json`
      )
    );

    await Message.model.remove({});
    await Message.model.create(messages);
    console.log("restore message success");

    // Chat Groups
    const chatGroups = JSON.parse(
      fs.readFileSync(
        `${path.resolve()}/src/backupMongoose/${version}/chat-groups.json`
      )
    );

    await ChatGroup.remove({});
    await ChatGroup.create(chatGroups);
    console.log("restore chat groups success");

    // Contact
    const contacts = JSON.parse(
      fs.readFileSync(
        `${path.resolve()}/src/backupMongoose/${version}/contacts.json`
      )
    );

    await Contact.remove({});
    await Contact.create(contacts);
    console.log("restore contacts success");

    // Notification
    const notifications = JSON.parse(
      fs.readFileSync(
        `${path.resolve()}/src/backupMongoose/${version}/notifications.json`
      )
    );

    await Notification.model.remove({});
    await Notification.model.create(notifications);
    console.log("restore notifications success");

    await req.flash("success", "Restore database successful");

    return res.redirect("/admin/backup");
  } catch (error) {
    console.log(error);
    await req.flash("error", "Restore Database error");
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
    const date = new Date().getTime();

    fs.mkdir(
      `${path.resolve()}/src/backupMongoose/${date}`,
      { recursive: true },
      (err) => {
        if (err) throw err;
        fs.writeFile(
          `${path.resolve()}/src/backupMongoose/${date}/users.json`,
          JSON.stringify(users),
          "utf8",
          function (err) {
            if (err) {
              console.log(err);
              throw err;
            }
            console.log("User create successfully");
          }
        );

        fs.writeFile(
          `${path.resolve()}/src/backupMongoose/${date}/chat-groups.json`,
          JSON.stringify(chatGroups),
          "utf8",
          function (err) {
            if (err) throw err;
            console.log("Chat groups create successfully");
          }
        );

        fs.writeFile(
          `${path.resolve()}/src/backupMongoose/${date}/messages.json`,
          JSON.stringify(messages),
          "utf8",
          function (err) {
            if (err) throw err;
            console.log("Message create successfully");
          }
        );
        fs.writeFile(
          `${path.resolve()}/src/backupMongoose/${date}/contacts.json`,
          JSON.stringify(contacts),
          "utf8",
          function (err) {
            if (err) throw err;
            console.log("Contact create successfully");
          }
        );
        fs.writeFile(
          `${path.resolve()}/src/backupMongoose/${date}/notifications.json`,
          JSON.stringify(notifications),
          "utf8",
          function (err) {
            if (err) throw err;
            console.log("Notification create successfully");
          }
        );
      }
    );

    await req.flash("success", "Backup Mongoose Sucessfull");
    return res.redirect("/admin/backup");
  } catch (error) {
    console.log(error);
    await req.flash("error", "Some errors occur");
    return res.redirect("/admin/backup");
  }
};
module.exports = {
  getBackUp,
  postBackUp,
  postRestore,
  postBackupDatabase,
};
