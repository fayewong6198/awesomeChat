function addMoreMembersToGroup() {
  $("ul#group-chat-member").find("div.add-user").bind("click", function() {
    let uid = $(this).data("uid");
    $(this).remove();
    let html = $("ul#group-chat-member").find("div[data-uid=" + uid + "]").html();

    let promise = new Promise(function(resolve, reject) {
      $("ul#friends-added").append(html);
      $("#addMembersModal .list-user-added").show();
      resolve(true);
    });
    promise.then(function(success) {
      $("ul#group-chat-member").find("div[data-uid=" + uid + "]").remove();
    });
  });
}

function callSearchMember(element) {
  if(element.which === 13 || element.type === "click") {
    let keyword = $("#input-search-more-member-to-add-group-chat").val();
    let regexKeyword = new RegExp(/^[\s0-9a-zA-Z_ÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹ ]+$/);
    if (!keyword.length) {
      alertify.notify("Bạn chưa nhập nội dung tìm kiếm.", "error", 7);
      return false;
    }
    if (!regexKeyword.test(keyword)) {
      alertify.notify("Không chấp nhận có ký tự đặc biệt.", "error", 7);
      return false;
    }

    $.get(`/contact/search-more-members/${keyword}`, function(data) {
      $("ul#group-chat-member").html(data);
        // Thêm người dùng vào danh sách liệt kê trước khi tạo nhóm trò chuyện
        cancelAddMember();
        addMoreMembersToGroup();
    });
  }
}

function cancelAddMember() {
  $("#btn-cancel-add-more-member").bind("click", function() {
    $("#addMembersModal .list-user-added").hide();
    if ($("ul#friends-added>li").length) {
      $("ul#friends-added>li").each(function(index) {
        $(this).remove();
      });
    }
  });
}

function addNew() {
  $("#btn-add-more-member").unbind("click").on("click", function() {
    let groupChatId = $("#select-group-id option:selected").val();

    let arrayIds = [];
    $("ul#friends-added").find("li").each(function(index, item) {
      arrayIds.push({"userId": $(item).data("uid")});
    });

    let dataToAddMember = {
      arrayIds: arrayIds,
      groupChatId: groupChatId
    };

    $.ajax({
      url: "/group-chat/add-more-member",
      type: "post",
      data: dataToAddMember,
      success: function(data) {
        $("#btn-cancel-add-more-member").click();
        $("#addMembersModal").modal("hide");
      },
      error: function(response) {
        alertify.notify(response.responseText, "error", 7);
      }
    });
  });
}

$(document).ready(function() {
  $("#input-search-more-member-to-add-group-chat").bind("keypress", callSearchMember);
  $("#btn-search-more-member-to-add-group-chat").bind("click", callSearchMember);
  addNew();
});