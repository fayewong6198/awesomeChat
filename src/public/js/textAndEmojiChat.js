function textAndEmojiChat(divId) {
  $(".emojionearea")
    .unbind("keyup")
    .on("keyup", function (element) {
      let currentEmojioneArea = $(this);
      if (element.which === 13) {
        let targetId = $(`#write-chat-${divId}`).data("chat");
        let messageVal = $(`#write-chat-${divId}`).val();

        if (!targetId.length || !messageVal.length) {
          return false;
        }

        let dataTextEmojiForSend = {
          uid: targetId,
          messageVal: messageVal,
        };

        if ($(`#write-chat-${divId}`).hasClass("chat-in-group")) {
          dataTextEmojiForSend.isChatGroup = true;
        }

        $.post("/message/add-new-text-emoji", dataTextEmojiForSend, function (
          data
        ) {
          //success
          let dataToEmit = {
            message: data.message,
          };
          console.log(data);
          let isChatGroup =
            data.message.conversationType == "group" ? true : false;
          let myMessage = $(
            `<div id="${data.message._id}" class="bubble me" data-mess-id="${data.message._id}"></div>`
          );
          myMessage.text(data.message.text);
          let convertEmojioneMessage = emojione.toImage(myMessage.html());

          if (dataTextEmojiForSend.isChatGroup) {
            let senderAvatar = `<img src="/images/users/${data.message.sender.avatar}" class="avatar-small" title="${data.message.sender.name}" />`;
            myMessage.html(`${senderAvatar} ${convertEmojioneMessage} <button
            onclick="removeTextEmoji('${data.message._id}','${data.message.receiverId}',${isChatGroup})"
            class="btn btn-danger"
          >
            Delete
          </button>`);
            increaseNumberMessageGroup(divId);
            dataToEmit.groupId = targetId;
          } else {
            myMessage.html(`${convertEmojioneMessage} <button
            onclick="removeTextEmoji('${data.message._id}','${data.message.receiverId}',${isChatGroup})"
            class="btn btn-danger">
            Delete
          </button>`);
            dataToEmit.contactId = targetId;
          }

          $(`.right .chat[data-chat=${divId}]`).append(myMessage);
          nineScrollRight(divId);

          $(`#write-chat-${divId}`).val("");
          currentEmojioneArea.find(".emojionearea-editor").text("");

          $(`.person[data-chat=${divId}]`)
            .find("span.time")
            .removeClass("message-time-realtime")
            .html(
              moment(data.message.createdAt)
                .locale("vi")
                .startOf("seconds")
                .fromNow()
            );
          $(`.person[data-chat=${divId}]`)
            .find("span.preview")
            .html(emojione.toImage(data.message.text));

          $(`.person[data-chat=${divId}]`).on(
            "livechat07.moveConversationToTop",
            function () {
              let dataToMove = $(this).parent();
              $(this).closest("ul").prepend(dataToMove);
              $(this).off("livechat07.moveConversationToTop");
            }
          );
          $(`.person[data-chat=${divId}]`).trigger(
            "livechat07.moveConversationToTop"
          );

          socket.emit("chat-text-emoji", dataToEmit);

          //emit remove typing realtime
          typingOff(divId);

          let checkTyping = $(`.chat[data-chat=${divId}]`).find(
            "div.bubble-typing-gif"
          );
          if (checkTyping.length) {
            checkTyping.remove();
          }
        }).fail(function (response) {
          //error
          alertify.notify(response.responseText, "error", 7);
        });
      }
    });
}

// Remove message

function removeTextEmoji(messageId, reciverId, isChatGroup) {
  console.log("messageId ", messageId);
  console.log("reciverId ", reciverId);
  console.log("isGroup ", isChatGroup);

  let dataTextEmojiForSend = {
    uid: reciverId,
    messageId: messageId,
    isChatGroup: isChatGroup,
  };

  $.ajax({
    url: "/message",
    type: "DELETE",
    dataType: "json",
    data: dataTextEmojiForSend,
    success: function (response) {
      console.log("message_Id ", response.message._id);
      console.log("reciverId ", response.message.receiverId);
      console.log("isGroup ", response.message.conversationType);
      socket.emit("deleted-chat-text-emoji", {
        groupId: response.message.receiverId,
        message: response.message,
        messageId: response.message._id,
      });

      let avatar = `<img src="/images/users/${response.message.sender.avatar}" class="avatar-small" title="${response.message.sender.name}" />`;
      let text = "This message has been removed";
      console.log("dit me may");
      console.log(response.message._id);
      $(`#${response.message._id}`).html(`${avatar}${text}`);

      $(`#${response.message._id}`).append(
        `<button
        onclick="restoreTextEmoji('${response.message._id}','${response.message.receiverId}',${response.group})"
        class="btn btn-danger"
      >
        Restore
      </button>`
      );
    },
    error: function (response) {
      alertify.notify(response.responseText, "error", 7);
    },
  });
}

// Restore message

function restoreTextEmoji(messageId, reciverId, isChatGroup) {
  console.log("restore");
  console.log("isChatGroupInAction", isChatGroup);
  console.log(isChatGroup);

  let dataTextEmojiForSend = {
    uid: reciverId,
    messageId: messageId,
    isChatGroup: isChatGroup,
  };

  $.ajax({
    url: `/message/${messageId}`,
    type: "PUT",
    dataType: "json",
    data: dataTextEmojiForSend,
    success: function (response) {
      socket.emit("restored-chat-text-emoji", {
        groupId: response.message.receiverId,
        message: response.message,
        messageId: response.message._id,
      });

      $(`#${response.message._id}`).text(response.message.text);
      $(`#${response.message._id}`).append(
        `<button
          onclick="removeTextEmoji('${response.message._id}','${response.message.receiverId}','${isChatGroup}')"
          class="btn btn-danger"
        >
          Delete
        </button>`
      );
      console.log("append success");
      console.log($(`#${response.message._id}`));
    },
    error: function (response) {
      alertify.notify(response.responseText, "error", 7);
    },
  });
}

$(document).ready(function () {
  socket.on("response-chat-text-emoji", function (response) {
    let divId = "";

    console.log("reviced message");
    console.log(response);

    let yourMessage = $(
      `<div id="${response.message._id}" class="bubble you" data-mess-id="${response.message._id}"></div>`
    );
    yourMessage.text(response.message.text);
    let convertEmojioneMessage = emojione.toImage(yourMessage.html());

    if (response.currentGroupId) {
      let senderAvatar = `<img src="/images/users/${response.message.sender.avatar}" class="avatar-small" title="${response.message.sender.name}" />`;
      yourMessage.html(`${senderAvatar} ${convertEmojioneMessage}`);
      divId = response.currentGroupId;

      if (response.currentUserId !== $("#dropdown-navbar-user").data("uid")) {
        increaseNumberMessageGroup(divId);
      }
    } else {
      yourMessage.html(convertEmojioneMessage);
      divId = response.currentUserId;
    }

    if (response.currentUserId !== $("#dropdown-navbar-user").data("uid")) {
      $(`.right .chat[data-chat=${divId}]`).append(yourMessage);
      nineScrollRight(divId);
      $(`.person[data-chat=${divId}]`)
        .find("span.time")
        .addClass("message-time-realtime");
    }

    $(`.person[data-chat=${divId}]`)
      .find("span.time")
      .html(
        moment(response.message.createdAt)
          .locale("vi")
          .startOf("seconds")
          .fromNow()
      );
    $(`.person[data-chat=${divId}]`)
      .find("span.preview")
      .html(emojione.toImage(response.message.text));

    $(`.person[data-chat=${divId}]`).on(
      "livechat07.moveConversationToTop",
      function () {
        let dataToMove = $(this).parent();
        $(this).closest("ul").prepend(dataToMove);
        $(this).off("livechat07.moveConversationToTop");
      }
    );
    $(`.person[data-chat=${divId}]`).trigger(
      "livechat07.moveConversationToTop"
    );
  });
  socket.on("response-deleted-chat-text-emoji", function (response) {
    console.log("response-deleted Event");
    console.log(response);

    let avatar = `<img src="/images/users/${response.message.sender.avatar}" class="avatar-small" title="${response.message.sender.name}" />`;
    let text = "This message has been removed";
    $(`#${response.messageId}`).html(`${avatar}${text}`);
    if (response.currentUserId === $("#dropdown-navbar-user").data("uid")) {
      $(`#${response.messageId}`).append(
        `<button
        onclick="restoreTextEmoji('${response.message._id}','${response.message.receiverId}',${response.group})"
        class="btn btn-danger"
      >
        Restore
      </button>`
      );
    }
  });
  socket.on("response-restored-chat-text-emoji", function (response) {
    console.log("response-restore Event");
    console.log(response);
    let avatar = `<img src="/images/users/${response.message.sender.avatar}" class="avatar-small" title="${response.message.sender.name}" />`;
    let text = response.message.text;
    $(`#${response.messageId}`).html(`${avatar}${text}`);
    if (response.currentUserId === $("#dropdown-navbar-user").data("uid")) {
      $(`#${response.messageId}`).append(
        `<button
          onclick="removeTextEmoji('${response.message._id}','${response.message.receiverId}',${response.group})"
          class="btn btn-danger"
        >
          Delete
        </button>`
      );
    }
  });
});

// $(document).ready(function () {
//   socket.on("response-deleted-chat-text-emoji", function (response) {
//     console.log("response-deleted Event");
//   });
// });

// $(document).ready(function () {
//   socket.on("deleted-chat-text-emoji", function (response) {
//     console.log("deleted Event");
//   });
// });
