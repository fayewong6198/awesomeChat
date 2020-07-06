function removeGroupChat(divId) {
  $(".remove-group-chat").unbind("click").on("click", function() {
    let groupChatId = divId;
    let dataToRemove = {
      groupChatId: groupChatId
    };
  
    Swal.fire({
			title: `Bạn có chắc muốn xóa nhóm chat không?`,
			text: "Bạn không thể hoàn tác lại quá trình này!",
			type: "warning",
			showCancelButton: true,
			confirmButtonColor: "#2ECC71",
			cancelButtonColor: "#ff7675",
			confirmButtonText: "xác nhận!",
			cancelButtonText: "Hủy"
		}).then((result) => {
			if (!result.value) {
				return false;
			}
			$.ajax({
				url: "/group-chat/remove-group-chat",
				type: "delete",
				data: dataToRemove,
				success: function(data) {
					if(data.success) {

            //chức năng xóa user ở leftside khi hủy kết bạn
            //Bước 0 check active
            let checkActive = $("#all-chat").find(`li[data-chat = ${dataToRemove.groupChatId}]`).hasClass("active");
            console.log(dataToRemove.groupChatId);
						//Bước 01 remove user bên leftside
            $("#all-chat").find(`ul a[href = "#uid_${dataToRemove.groupChatId}"]`).remove();
            $("#group-chat").find(`ul a[href = "#uid_${dataToRemove.groupChatId}"]`).remove(); 
            
            //Bước 02 remove user bên rightSide
						$("#screen-chat").find(`div#to_${dataToRemove.groupChatId}`).remove();

						//Bước 03 remove image modal
						$("body").find(`div#imagesModal_${dataToRemove.groupChatId}`).remove();

						//Bước 04 remove attach modal
            $("body").find(`div#attachmentsModal_${dataToRemove.groupChatId}`).remove();
            
            //Bước 05 remove member Modal
            $("body").find(`div#groupMembersModal_${dataToRemove.groupChatId}`).remove();

           // Bước 06 click first conversation index = 0
            if (checkActive) {
              $("ul.people").find("a")[0].click();
            }
					}
				}
			});
		});
  });
}