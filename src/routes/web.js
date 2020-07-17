import express from "express";
import {
  home,
  auth,
  user,
  contact,
  notification,
  message,
  groupChat,
  adminUser,
  backup,
  adminChat,
  adminGroupChat,
} from "./../controllers/index";
import {
  authValid,
  userValid,
  contactValid,
  messageValid,
  groupChatValid,
} from "./../validation/index";
import initPassportLocal from "./../controllers/passportController/local";
import passport from "passport";
import initPassportFacebook from "./../controllers/passportController/facebook";
import initPassportGoogle from "./../controllers/passportController/google";

initPassportLocal();
initPassportFacebook();
initPassportGoogle();

let router = express.Router();

let initRoutes = (app) => {
  router.get("/", auth.checkLoggedIn, home.getHome);
  router.get("/login-register", auth.checkLoggedOut, auth.getLoginRegister);
  router.post(
    "/register",
    auth.checkLoggedOut,
    authValid.register,
    auth.postRegister
  );
  router.get("/verify/:token", auth.checkLoggedOut, auth.verifyAccount);
  router.post(
    "/login",
    auth.checkLoggedOut,
    passport.authenticate("local", {
      successRedirect: "/",
      failureRedirect: "/login-register",
      successFlash: true,
      failureFlash: true,
    })
  );
  router.get(
    "/auth/facebook",
    auth.checkLoggedOut,
    passport.authenticate("facebook", { scope: ["email"] })
  );
  router.get(
    "/auth/facebook/callback",
    auth.checkLoggedOut,
    passport.authenticate("facebook", {
      successRedirect: "/",
      failureRedirect: "/login-register",
    })
  );
  router.get(
    "/auth/google",
    auth.checkLoggedOut,
    passport.authenticate("google", { scope: ["openid", "email", "profile"] })
  );
  router.get(
    "/auth/google/callback",
    auth.checkLoggedOut,
    passport.authenticate("google", {
      successRedirect: "/",
      failureRedirect: "/login-register",
    })
  );

  router.get("/logout", auth.checkLoggedIn, auth.getLogout);
  router.put("/user/update-avatar", auth.checkLoggedIn, user.updateAvatar);
  router.put(
    "/user/update-info",
    auth.checkLoggedIn,
    userValid.updateInfo,
    user.updateInfo
  );
  router.put(
    "/user/update-password",
    auth.checkLoggedIn,
    userValid.updatePassword,
    user.updatePassword
  );
  router.get(
    "/contact/find-users/:keyword",
    auth.checkLoggedIn,
    contactValid.findUsersContact,
    contact.findUsersContact
  );
  router.post("/contact/add-new", auth.checkLoggedIn, contact.addNew);
  router.delete(
    "/contact/remove-contact",
    auth.checkLoggedIn,
    contact.removeContact
  );
  router.delete(
    "/contact/remove-request-contact-sent",
    auth.checkLoggedIn,
    contact.removeRequestContactSent
  );
  router.delete(
    "/contact/remove-request-contact-received",
    auth.checkLoggedIn,
    contact.removeRequestContactReceived
  );
  router.put(
    "/contact/approve-request-contact-received",
    auth.checkLoggedIn,
    contact.approveRequestContactReceived
  );
  router.get(
    "/contact/read-more-contacts",
    auth.checkLoggedIn,
    contact.readMoreContacts
  );
  router.get(
    "/contact/read-more-contacts-sent",
    auth.checkLoggedIn,
    contact.readMoreContactsSent
  );
  router.get(
    "/contact/read-more-contacts-received",
    auth.checkLoggedIn,
    contact.readMoreContactsReceived
  );
  router.get(
    "/contact/search-friends/:keyword",
    auth.checkLoggedIn,
    contactValid.searchFriends,
    contact.searchFriends
  );

  router.get(
    "/notification/read-more",
    auth.checkLoggedIn,
    notification.readMore
  );
  router.put(
    "/notification/mark-all-as-read",
    auth.checkLoggedIn,
    notification.markAllAsRead
  );

  router.post(
    "/message/add-new-text-emoji",
    auth.checkLoggedIn,
    messageValid.checkMessageLength,
    message.addNewTextEmoji
  );
  router.post(
    "/message/add-new-image",
    auth.checkLoggedIn,
    message.addNewImage
  );
  router.post(
    "/message/add-new-attachment",
    auth.checkLoggedIn,
    message.addNewAttachment
  );

  router.delete("/message", auth.checkLoggedIn, message.removeTextEmoji);
  router.put(
    "/message/:messageId",
    auth.checkLoggedIn,
    message.restoreTextEmoji
  );

  router.post(
    "/group-chat/add-new",
    auth.checkLoggedIn,
    groupChatValid.addNewGroup,
    groupChat.addNewGroup
  );
  router.get(
    "/message/read-more-all-chat",
    auth.checkLoggedIn,
    message.readMoreAllChat
  );
  router.get("/message/read-more", auth.checkLoggedIn, message.readMore);

  router.delete(
    "/group-chat/remove-member",
    auth.checkLoggedIn,
    groupChat.removeMember
  );
  router.post(
    "/group-chat/add-more-member",
    auth.checkLoggedIn,
    groupChat.addNewMembers
  );
  router.get(
    "/contact/search-more-members/:keyword",
    auth.checkLoggedIn,
    contactValid.searchFriends,
    contact.searchFriendsToAddGoup
  );

  // reset password
  router
    .route("/reset-password")
    .get(auth.getResetPassword)
    .post(auth.postResetPassword);

  router
    .route("/reset-password/:token")
    .get(auth.confirmEmail)
    .post(auth.createNewPassword);

  // ----------------Admin---------------------//
  // User
  // router.get("/admin/users", auth.checkLoggedIn, adminUser.listUser);
  router
    .route("/admin/users")
    .get(
      auth.checkLoggedIn,
      auth.checkRoles("staff", "admin"),
      adminUser.listUser
    );
  router
    .route("/admin/users/create")
    .get(
      auth.checkLoggedIn,
      auth.checkRoles("staff", "admin"),
      auth.checkPermistions("CREATE_USER"),
      adminUser.createUser
    )
    .post(
      auth.checkLoggedIn,
      auth.checkRoles("staff", "admin"),
      auth.checkPermistions("CREATE_USER"),
      authValid.register,
      adminUser.postCreateUser
    );
  router
    .route("/admin/users/:id")
    .get(
      auth.checkLoggedIn,
      auth.checkRoles("staff", "admin"),
      adminUser.retrieveUser
    );
  router
    .route("/admin/users/update/:id")
    .post(
      auth.checkLoggedIn,
      auth.checkRoles("staff", "admin"),
      auth.checkPermistions("UPDATE_USER"),
      adminUser.updateUser
    );
  router
    .route("/admin/users/delete/:id")
    .post(
      auth.checkLoggedIn,
      auth.checkRoles("staff", "admin"),
      auth.checkPermistions("DELETE_USER"),
      adminUser.deleteUser
    );

  router
    .route("/admin/backup")
    .get(
      auth.checkLoggedIn,
      auth.checkRoles("staff", "admin"),
      backup.getBackUp
    );

  router
    .route("/admin/backup")
    .post(
      auth.checkLoggedIn,
      auth.checkRoles("staff", "admin"),
      backup.postBackUp
    );

  router
    .route("/admin/backup/database")
    .post(
      auth.checkLoggedIn,
      auth.checkRoles("staff", "admin"),
      backup.postBackupDatabase
    );
  router
    .route("/admin/restore")
    .post(
      auth.checkLoggedIn,
      auth.checkRoles("staff", "admin"),
      backup.postRestore
    );

  router.route("/admin/chats").get(adminChat.list);
  router.route("/admin/chats/:id").get(adminChat.retrieve);
  router.route("/admin/groupChats").get(adminGroupChat.list);
  router.route("/admin/groupChats/:id").get(adminGroupChat.retrieve);

  return app.use("/", router);
};

module.exports = initRoutes;
