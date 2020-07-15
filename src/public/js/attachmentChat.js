function attachmentChat(divId) {
  $(`#attachment-chat-${divId}`)
    .unbind("change")
    .on("change", function () {
      let fileData = $(this).prop("files")[0];
      let limit = 1048576; //byte = 1MB

      if (fileData.size > limit) {
        alertify.notify(
          `Kích thước tối đa cho phép là 1 MB. ${fileData.size}`,
          "error",
          7
        );
        $(this).val(null);
        return false;
      }

      let targetId = $(this).data("chat");
      let isChatGroup = false;

      let messageFromData = new FormData();
      messageFromData.append("my-attachment-chat", fileData);
      messageFromData.append("uid", targetId);

      if ($(this).hasClass("chat-in-group")) {
        messageFromData.append("isChatGroup", true);
        isChatGroup = true;
      }

      $.ajax({
        url: "/message/add-new-attachment",
        type: "post",
        cache: false,
        contentType: false,
        processData: false,
        data: messageFromData,
        success: function (data) {
          let dataToEmit = {
            message: data.message,
          };
          console.log(data);
          let myMessage = $(
            `<div class="bubble me bubble-attachment-file" data-mess-id="${data.message._id}" id="${data.message._id}"  oncontextmenu="show_menu('${data.message.senderId} ==  user._id %>','${data.message._id}' )"></div>`
          );
          let attachmentChat = `<a href="data:${
            data.message.file.contentType
          }; base64, ${bufferToBase64(
            data.message.file.data.data
          )}" download="${data.message.file.fileName}">${
            data.message.file.fileName
          }</a>`;

          if (isChatGroup) {
            let senderAvatar = `<img src="/images/users/${data.message.sender.avatar}" class="avatar-small" title="${data.message.sender.name}" />`;
            myMessage.html(`${senderAvatar} ${attachmentChat}
            
          <div
          class="dropdown-menu right-click-menu context-menu"
          id="context-menu${data.message._id}"
        >
          <p
            class="dropdown-item"
            onclick="removeChatAttachment('${data.message._id}','${data.message.receiverId}',${isChatGroup})"
          >
          Remove
          </p>
        </div>
            `);
            increaseNumberMessageGroup(divId);
            dataToEmit.groupId = targetId;
          } else {
            myMessage.html(`${attachmentChat}
          <div
          class="dropdown-menu right-click-menu context-menu"
          id="context-menu${data.message._id}"
        >
          <p
            class="dropdown-item"
            onclick="removeChatAttachment('${data.message._id}','${data.message.receiverId}',${isChatGroup})"
          >
          Remove
          </p>
        </div>
          `);
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
            .html("Tệp đính kèm...");

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

          socket.emit("chat-attachment", dataToEmit);

          let attachmentChatToAddModal = `
          <li>
            <a href="data:${
              data.message.file.contentType
            }; base64, ${bufferToBase64(
            data.message.file.data.data
          )}" download="${data.message.file.fileName}">
                ${data.message.file.fileName}
            </a>
          </li>`;
          $(`#attachmentsModal_${divId}`)
            .find("ul.list-attachments")
            .append(attachmentChatToAddModal);
        },
        error: function (error) {
          alertify.notify(error.responseText, "error", 7);
        },
      });
    });
}

function removeChatAttachment(messageId, reciverId, isChatGroup) {
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
      socket.emit("deleted-chat-attachment", {
        groupId: response.message.receiverId,
        message: response.message,
        messageId: response.message._id,
      });

      let avatar = `<img src="/images/users/${response.message.sender.avatar}" class="avatar-small" title="${response.message.sender.name}" />`;
      let text = "This message has been removed";
      $(`#${response.message._id}`).html(`${avatar}${text}`);

      $(`#${response.message._id}`).append(
        `
      <div
      class="dropdown-menu right-click-menu context-menu"
      id="context-menu${response.message._id}"
    >
      <p
        class="dropdown-item"
        onclick="restoreChatAttachment('${response.message._id}','${response.message.receiverId}',${response.group})"
      >
      Restore
      </p>
    </div>
      
      `
      );
    },
    error: function (response) {
      alertify.notify(response.responseText, "error", 7);
    },
  });
}

function restoreChatAttachment(messageId, reciverId, isChatGroup) {
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
      socket.emit("restored-chat-attachment", {
        groupId: response.message.receiverId,
        message: response.message,
        messageId: response.message._id,
      });

      let avatar = `<img src="/images/users/${response.message.sender.avatar}" class="avatar-small" title="${response.message.sender.name}" />`;
      let attachmentChat = `<a href="data:${
        response.message.file.contentType
      }; base64, ${bufferToBase64(
        response.message.file.data.data
      )}" download="${response.message.file.fileName}">${
        response.message.file.fileName
      }</a>`;

      $(`#${response.message._id}`).html(`${avatar}${attachmentChat}`);
      $(`#${response.message._id}`).append(
        `
      <div
      class="dropdown-menu right-click-menu context-menu"
      id="context-menu${response.message._id}"
    >
      <p
        class="dropdown-item"
        onclick="removeChatAttachment('${response.message._id}','${response.message.receiverId}',${response.group})"
      >
      Remove
      </p>
    </div>

      `
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
  socket.on("response-chat-attachment", function (response) {
    let divId = "";

    let yourMessage = $(
      `<div class="bubble you bubble-attachment-file" data-mess-id="${response.message._id}" id="${response.message._id}"></div>`
    );
    let attachmentChat = `<a href="data:${
      response.message.file.contentType
    }; base64, ${bufferToBase64(response.message.file.data.data)}" download="${
      response.message.file.fileName
    }">${response.message.file.fileName}</a>`;

    if (response.currentGroupId) {
      let senderAvatar = `<img src="/images/users/${response.message.sender.avatar}" class="avatar-small" title="${response.message.sender.name}" />`;
      yourMessage.html(`${senderAvatar} ${attachmentChat}`);
      divId = response.currentGroupId;

      if (response.currentUserId !== $("#dropdown-navbar-user").data("uid")) {
        increaseNumberMessageGroup(divId);
      }
    } else {
      yourMessage.html(attachmentChat);
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
      .html("Tệp đính kèm...");

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
      let attachmentChatToAddModal = `
          <li>
            <a href="data:${
              response.message.file.contentType
            }; base64, ${bufferToBase64(
        response.message.file.data.data
      )}" download="${response.message.file.fileName}">
                ${response.message.file.fileName}
            </a>
          </li>`;
      $(`#attachmentsModal_${divId}`)
        .find("ul.list-attachments")
        .append(attachmentChatToAddModal);
    }
  });

  socket.on("response-deleted-chat-attachment", function (response) {
    console.log("response-deleted attachment Event");
    console.log(response);

    let avatar = `<img src="/images/users/${response.message.sender.avatar}" class="avatar-small" title="${response.message.sender.name}" />`;
    let text = "This message has been removed";
    $(`#${response.messageId}`).html(`${avatar}${text}`);
    if (response.currentUserId === $("#dropdown-navbar-user").data("uid")) {
      $(`#${response.messageId}`).append(
        `
      <div
      class="dropdown-menu right-click-menu context-menu"
      id="context-menu${response.message._id}"
    >
      <p
        class="dropdown-item"
        onclick="restoreChatAttachment('${response.message._id}','${response.message.receiverId}',${response.group})"
      >
      Restore
      </p>
    </div>
      `
      );
    }
  });
  socket.on("response-restored-chat-attachment", function (response) {
    console.log("response-restore attachment Event");
    console.log(response);
    let avatar = `<img src="/images/users/${response.message.sender.avatar}" class="avatar-small" title="${response.message.sender.name}" />`;
    let attachmentChat = `<a href="data:${
      response.message.file.contentType
    }; base64, ${bufferToBase64(response.message.file.data.data)}" download="${
      response.message.file.fileName
    }">${response.message.file.fileName}</a>`;

    $(`#${response.messageId}`).html(`${avatar}${attachmentChat}`);
    if (response.currentUserId === $("#dropdown-navbar-user").data("uid")) {
      $(`#${response.messageId}`).append(
        `
        <div
        class="dropdown-menu right-click-menu context-menu"
        id="context-menu${response.message._id}"
      >
        <p
          class="dropdown-item"
          onclick="removeChatAttachment('${response.message._id}','${response.message.receiverId}',${response.group})"
        >
          Delete
        </p>
      </div>
        `
      );
    }
  });
});
