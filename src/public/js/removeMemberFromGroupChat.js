function removeMember(divId) {
  $(".remove-user")
    .unbind("click")
    .on("click", function () {
      let targetId = $(this).data("uid");
      let username = $(this).parent().find("div.user-name p").text();

      let groupChatId = divId;

      let dataToRemove = {
        uid: targetId,
        groupChatId: groupChatId,
      };

      //let countMember = $(`div#groupMembersModal_${divId}`).find("ul.membersList").children("li").length;

      // if ( countMember < 3 || countMember === 3) {
      // 	alertify.notify("Chỉ được xóa khi số thành viên lớn hơn 3", "error", 5);
      // 	console.log(countMember);
      // 	return false;
      // }

      Swal.fire({
        title: `Bạn có chắc muốn xóa ${username} khỏi nhóm chat không?`,
        text: "Bạn không thể hoàn tác lại quá trình này!",
        type: "warning",
        showCancelButton: true,
        confirmButtonColor: "#2ECC71",
        cancelButtonColor: "#ff7675",
        confirmButtonText: "xác nhận!",
        cancelButtonText: "Hủy",
      }).then((result) => {
        if (!result.value) {
          return false;
        }
        $.ajax({
          url: "/group-chat/remove-member",
          type: "delete",
          data: dataToRemove,
          success: function (data) {
            if (data.success) {
              $("ul.membersList").find(`li[data-uid=${targetId}]`).remove();
              console.log(data);
              console.log(groupChatId);
              //Count userAmount
              socket.emit("remove-member", { contactId: targetId, data });
              $(`#count-members_${data.chatGroup._id}`).html(
                data.chatGroup.members.length
              );
              //console.log(countMember);
            }
          },
        });
      });
    });
}
socket.on("response-remove-member", function (data) {
  console.log(`#all_chat_${data.id}`);
  $(`#all_chat_${data.id}`).empty();
  $(`#room_chat_${data.id}`).empty();
  $(`#count-members_${data.chatGroup._id}`).html(data.chatGroup.members.length);
  let notif = `<div class="notif-read-false" data-uid="${data.user.id}">
  <img class="avatar-small" src="images/users/${data.user.avatar}" alt=""> 
  <strong>${data.user.username}</strong> xóa bạn ra khỏi nhóm
  </div>`;
  $(".noti_content").prepend(notif); //popup notif
  //Count userAmount
});
