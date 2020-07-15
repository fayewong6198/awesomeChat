function imageChat(divId) {
  $(`#image-chat-${divId}`)
    .unbind("change")
    .on("change", function () {
      let fileData = $(this).prop("files")[0];
      let math = ["image/png", "image/jpg", "image/jpeg"];
      let limit = 1048576; //byte = 1MB

      if ($.inArray(fileData.type, math) === -1) {
        alertify.notify("Kiểu file không hợp lệ.", "error", 7);
        $(this).val(null);
        return false;
      }
      if (fileData.size > limit) {
        alertify.notify("Kích thước tối đa cho phép là 1 MB.", "error", 7);
        $(this).val(null);
        return false;
      }
      let targetId = $(this).data("chat");
      let isChatGroup = false;

      let messageFromData = new FormData();
      messageFromData.append("my-image-chat", fileData);
      messageFromData.append("uid", targetId);

      if ($(this).hasClass("chat-in-group")) {
        messageFromData.append("isChatGroup", true);
        isChatGroup = true;
      }

      $.ajax({
        url: "/message/add-new-image",
        type: "post",
        cache: false,
        contentType: false,
        processData: false,
        data: messageFromData,
        success: function (data) {
          let dataToEmit = {
            message: data.message,
          };

          let myMessage = $(
            `<div class="bubble me bubble-image-file" data-mess-id="${data.message._id}  oncontextmenu="show_menu('true','${data.message._id}' )""></div>`
          );
          let imageChat = `<img src="data:${
            data.message.file.contentType
          }; base64, ${bufferToBase64(
            data.message.file.data.data
          )}" class="show-image-chat">`;

          if (isChatGroup) {
            let senderAvatar = `<img src="/images/users/${data.message.sender.avatar}" class="avatar-small" title="${data.message.sender.name}" />`;
            myMessage.html(`${senderAvatar} ${imageChat}`);
            increaseNumberMessageGroup(divId);
            dataToEmit.groupId = targetId;
          } else {
            myMessage.html(imageChat);
            dataToEmit.contactId = targetId;
          }

          $(`.right .chat[data-chat=${divId}]`).append(myMessage);
          nineScrollRight(divId);

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
            .html("Hình ảnh...");

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

          socket.emit("chat-image", dataToEmit);

          let imageChatToAddModal = `<img src="data:${
            data.message.file.contentType
          }; base64, ${bufferToBase64(data.message.file.data.data)}">`;
          $(`#imagesModal_${divId}`)
            .find("div.all-images")
            .append(imageChatToAddModal);
        },
        error: function (error) {
          alertify.notify(error.responseText, "error", 7);
        },
      });
    });
}

// Remove image
function removeImageChat(messageId, reciverId, isChatGroup) {
  let dataTextEmojiForSend = {
    uid: reciverId,
    messageId: messageId,
    isChatGroup: isChatGroup,
  };

  $.ajax({
    url: `/message`,
    type: "delete",
    dataType: "json",

    data: dataTextEmojiForSend,
    success: function (data) {
      let dataToEmit = {
        groupId: data.message.receiverId,
        message: data.message,
        messageId: data.message._id,
      };

      let imageChat = `This message has been removed`;

      if (isChatGroup) {
        let senderAvatar = `<img src="/images/users/${data.message.sender.avatar}" class="avatar-small" title="${data.message.sender.name}" />`;
        $(`#${data.message._id}`).html(`${senderAvatar} ${imageChat}`);

        $(`#${data.message._id}`).append(
          `
        <div
        class="dropdown-menu right-click-menu context-menu"
        id="context-menu${data.message._id}"
      >
        <p
          class="dropdown-item"
          onclick="restoreImageChat('${data.message._id}','${data.message.receiverId}',${data.group})"
        >
        Restore
        </p>
      </div>
        `
        );
      } else {
        $(`#${data.message._id}`).html(`${imageChat}`);

        $(`#${data.message._id}`).append(
          `
        <div
        class="dropdown-menu right-click-menu context-menu"
        id="context-menu${data.message._id}"
      >
        <p
          class="dropdown-item"
          onclick="restoreImageChat('${data.message._id}','${data.message.receiverId}',${data.group})"
        >
        Restore
        </p>
      </div>
        `
        );
      }

      socket.emit("deleted-chat-image", dataToEmit);

      let imageChatToAddModal = `<img src="data:${
        data.message.file.contentType
      }; base64, ${bufferToBase64(data.message.file.data.data)}">`;
    },
    error: function (error) {
      alertify.notify(error.responseText, "error", 7);
    },
  });
}

// Restore image
function restoreImageChat(messageId, reciverId, isChatGroup) {
  let dataTextEmojiForSend = {
    uid: reciverId,
    messageId: messageId,
    isChatGroup: isChatGroup,
  };

  $.ajax({
    url: `/message/${messageId}`,
    type: "put",
    dataType: "json",
    data: dataTextEmojiForSend,
    success: function (data) {
      let dataToEmit = {
        groupId: data.message.receiverId,
        message: data.message,
        messageId: data.message._id,
      };

      let imageChat = `<img src="data:${
        data.message.file.contentType
      }; base64, ${bufferToBase64(
        data.message.file.data.data
      )}" class="show-image-chat">`;
      if (isChatGroup) {
        let senderAvatar = `<img src="/images/users/${data.message.sender.avatar}" class="avatar-small" title="${data.message.sender.name}" />`;
        $(`#${messageId}`).html(`${senderAvatar} ${imageChat}`);

        $(`#${data.message._id}`).append(
          `
        <div
        class="dropdown-menu right-click-menu context-menu"
        id="context-menu${data.message._id}"
      >
        <p
          class="dropdown-item"
          onclick="removeImageChat('${data.message._id}','${data.message.receiverId}',${data.group})"
        >
        Delete
        </p>
      </div>
        `
        );
      } else {
        $(`#${messageId}`).html(imageChat);
        $(`#${data.message._id}`).append(
          `
        <div
        class="dropdown-menu right-click-menu context-menu"
        id="context-menu${data.message._id}"
      >
        <p
          class="dropdown-item"
          onclick="removeImageChat('${data.message._id}','${data.message.receiverId}',${data.group})"
        >
        Delete
        </p>
      </div>
        `
        );
      }

      socket.emit("restored-chat-image", dataToEmit);

      let imageChatToAddModal = `<img src="data:${
        data.message.file.contentType
      }; base64, ${bufferToBase64(data.message.file.data.data)}">`;
      // $(`#imagesModal_${divId}`)
      //   .find("div.all-images")
      //   .append(imageChatToAddModal);
    },
    error: function (error) {
      alertify.notify(error.responseText, "error", 7);
    },
  });
}
$(document).ready(function () {
  socket.on("response-chat-image", function (response) {
    let divId = "";

    let yourMessage = $(
      `<div class="bubble you bubble-image-file" data-mess-id="${response.message._id}"></div>`
    );
    let imageChat = `<img src="data:${
      response.message.file.contentType
    }; base64, ${bufferToBase64(
      response.message.file.data.data
    )}" class="show-image-chat">`;

    if (response.currentGroupId) {
      let senderAvatar = `<img src="/images/users/${response.message.sender.avatar}" class="avatar-small" title="${response.message.sender.name}" />`;
      yourMessage.html(`${senderAvatar} ${imageChat}`);
      divId = response.currentGroupId;

      if (response.currentUserId !== $("#dropdown-navbar-user").data("uid")) {
        increaseNumberMessageGroup(divId);
      }
    } else {
      yourMessage.html(imageChat);
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
    $(`.person[data-chat=${divId}]`).find("span.preview").html("Hình ảnh...");

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

    if (response.currentUserId !== $("#dropdown-navbar-user").data("uid")) {
      let imageChatToAddModal = `<img src="data:${
        response.message.file.contentType
      }; base64, ${bufferToBase64(response.message.file.data.data)}">`;
      $(`#imagesModal_${divId}`)
        .find("div.all-images")
        .append(imageChatToAddModal);
    }
  });

  socket.on("response-restored-chat-image", function (response) {
    console.log("response-restore image Event");
    console.log(response);
    let avatar = `<img src="/images/users/${response.message.sender.avatar}" class="avatar-small" title="${response.message.sender.name}" />`;
    let imageChat = `<img src="data:${
      response.message.file.contentType
    }; base64, ${bufferToBase64(
      response.message.file.data.data
    )}" class="show-image-chat">`;
    $(`#${response.messageId}`).html(`${avatar}${imageChat}`);
    if (response.currentUserId === $("#dropdown-navbar-user").data("uid")) {
      $(`#${response.messageId}`).append(
        `
        <div
        class="dropdown-menu right-click-menu context-menu"
        id="context-menu${response.message._id}"
      >
        <p
          class="dropdown-item"
          onclick="removeImageChat('${response.message._id}','${response.message.receiverId}',${response.group})"
        >
        Delete
        </p>
      </div>
        `
      );
    }
  });

  socket.on("response-deleted-chat-image", function (response) {
    console.log("response-deleted image Event");
    console.log(response);
    let avatar = `<img src="/images/users/${response.message.sender.avatar}" class="avatar-small" title="${response.message.sender.name}" />`;
    let imageChat = `This message has been removed`;
    $(`#${response.messageId}`).html(`${avatar}${imageChat}`);
    if (response.currentUserId === $("#dropdown-navbar-user").data("uid")) {
      $(`#${response.messageId}`).append(
        `
        <div
        class="dropdown-menu right-click-menu context-menu"
        id="context-menu${response.message._id}"
      >
        <p
          class="dropdown-item"
          onclick="restoreImageChat('${response.message._id}','${response.message.receiverId}',${response.group})"
        >
          Restore
        </p>
      </div>
        `
      );
    }
  });
});
