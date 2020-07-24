import {
  pushSocketIdToArray,
  emitNotifyToArray,
  removeSocketIdFromArray,
} from "./../../helpers/socketHelper";

let removeMemberFromGroup = (io) => {
  let clients = {};
  io.on("connection", (socket) => {
    clients = pushSocketIdToArray(clients, socket.request.user._id, socket.id);
    console.log("clients", clients);
    socket.on("remove-member", (data) => {
      let response = {
        groupChat: data.data,
        user: data.data.user,
        id: data.data.chatGroup._id,
        deleted_id: data.contactId,
      };
      if (clients[data.contactId]) {
        emitNotifyToArray(
          clients,
          data.contactId,
          io,
          "response-remove-member",
          response
        );
      }
    });
    socket.on("disconnect", () => {
      clients = removeSocketIdFromArray(
        clients,
        socket.request.user._id,
        socket
      );
    });
    //console.log(clients);
  });
};

module.exports = removeMemberFromGroup;
