const socket = io();

function nineScrollLeft() {
  $('.left').niceScroll({
    smoothscroll: true,
    horizrailenabled: false,
    cursorcolor: '#ECECEC',
    cursorwidth: '7px',
    scrollspeed: 50
  });
}

function resizeNineScrollLeft() {
  $(".left").getNiceScroll().resize();
}

function nineScrollRight(divId) {
  $(`.right .chat[data-chat = ${divId}]`).niceScroll({
    smoothscroll: true,
    horizrailenabled: false,
    cursorcolor: '#ECECEC',
    cursorwidth: '7px',
    scrollspeed: 50
  });
  $(`.right .chat[data-chat = ${divId}]`).scrollTop($(`.right .chat[data-chat = ${divId}]`)[0].scrollHeight);
}

function enableEmojioneArea(divId) {
  $(`#write-chat-${divId}`).emojioneArea({
    standalone: false,
    pickerPosition: 'top',
    filtersPosition: 'bottom',
    tones: false,
    autocomplete: false,
    inline: true,
    hidePickerOnBlur: true,
    search: false,
    shortnames: false,
    events: {
      keyup: function(editor, event) {
        //gán giá trị thay đổi vào thẻ input đã bị ẩn
        $(`#write-chat-${divId}`).val(this.getText());
      },
      click: function() {
        //bật lắng nghe DOM cho việc chat tin nhắn văn bản emoji
        textAndEmojiChat(divId)
        //bật chức năng người dùng đang gõ tin nhắn
        typingOn(divId);
      },
      blur: function() {
        //tắt chức năng người dùng đang chat
        typingOff(divId);
      }
    },
  });
  $('.icon-chat').bind('click', function(event) {
    event.preventDefault();
    $('.emojionearea-button').click();
    $('.emojionearea-editor').focus();
  });
}

function spinLoaded() {
  $('.master-loading-style').css('display', 'none');
}

function spinLoading() {
  $('.master-loading-style').css('display', 'block');
}

function ajaxLoading() {
  $(document)
    .ajaxStart(function() {
      spinLoading();
    })
    .ajaxStop(function() {
      spinLoaded();
    });
}

function showModalContacts() {
  $('#show-modal-contacts').click(function() {
    $(this).find('.noti_contact_counter').fadeOut('slow');
  });
}

function configNotification() {
  $('#noti_Button').click(function() {
    $('#notifications').fadeToggle('fast', 'linear');
    $('.noti_counter').fadeOut('slow');
    return false;
  });
  $(".main-content").click(function() {
    $('#notifications').fadeOut('fast', 'linear');
  });
}

function gridPhotos(layoutNumber) {
  $(".show-images").unbind("click").on("click", function() {
    let href = $(this).attr("href");
    let modalImagesId = href.replace("#", "");

    let originDataImage = $(`#${modalImagesId}`).find("div.modal-body").html();

    let countRows = Math.ceil($(`#${modalImagesId}`).find("div.all-images>img").length / layoutNumber);
    let layoutStr = new Array(countRows).fill(layoutNumber).join("");
    $(`#${modalImagesId}`).find("div.all-images").photosetGrid({
      highresLinks: true,
      rel: "withhearts-gallery",
      gutter: "2px",
      layout: layoutStr,
      onComplete: function() {
        $(`#${modalImagesId}`).find(".all-images").css({
          "visibility": "visible"
        });
        $(`#${modalImagesId}`).find(".all-images a").colorbox({
          photo: true,
          scalePhotos: true,
          maxHeight: "90%",
          maxWidth: "90%"
        });
      }
    });
    //bắt sự kiện đóng modal
    $(`#${modalImagesId}`).on("hidden.bs.modal", function () {
      $(this).find("div.modal-body").html(originDataImage);
    });
  });
}

function flashMasterNotify() {
  let notify = $(".master-success-message").text();
  if(notify.length)  {
    alertify.notify(notify, "success", 7);
  }
}

function changeTypeChat() {
  $("#select-type-chat").bind("change", function() {
    let optionSelected = $("option:selected", this);
    optionSelected.tab("show");

    if ($(this).val() === "user-chat") {
      $(".create-group-chat").hide();
    } else {
      $(".create-group-chat").show();
    }
  });
}

function changeScreenChat() {
  $(".room-chat").unbind("click").on("click", function() {
    let divId = $(this).find("li").data("chat");
    $(".person").removeClass("active");
    $(`.person[data-chat=${divId}]`).addClass("active");
    $(this).tab("show");
    //Cấu hình thanh cuộn trong rightSide.ejs mỗi khi click vào một cuộc trò chuyện cụ thể
    nineScrollRight(divId);
     // Bật emoji, tham số truyền vào là id của box nhập nội dung tin nhắn
    enableEmojioneArea(divId);
    //Bật lắng nghe DOM cho việc nhắn tin hình ảnh
    imageChat(divId);
    //Bật lắng nghe DOM cho việc nhắn tin tệp
    attachmentChat(divId);
    //Bật lắng nghe DOM cho video chat
    videoChat(divId);
    //zoomImageChat();
    removeMember(divId);
  });
}

function convertEmoji() {
  $(".convert-emoji").each(function() {
    var original = $(this).html();
    var converted = joypixels.toImage(original);
    $(this).html(converted);
  });
}

function bufferToBase64(buffer) {
  return btoa(new Uint8Array(buffer).reduce((data, byte) => data + String.fromCharCode(byte), ""));
}

function zoomImageChat() {
  $(".show-image-chat").unbind("click").on("click", function() {
    $("#img-chat-modal").css("display", "block");
    $("#img-chat-modal-content").attr("src", $(this)[0].src);

    $("#img-chat-modal").on("click", function() {
      $(this).css("display", "none");
    });
  });
}

//Khi user chưa có bạn bè nào -> bật thông báo và chuyển tới modal contact
function notYetConversation() {
  if(!$("ul.people").find("a").length) {
    Swal.fire({
      title: "Bạn chưa có bạn bè ? Tìm kiếm bạn bè để trò chuyện!",
      type: "info",
      showCancelButton: false,
      confirmButtonColor: "#2ECC71",
      confirmButtonText: "Xác nhận",
    }).then((result) => {
      $("#contactsModal").modal("show");
    });
  }
}

//khi nhấn vào danh bạ, click vào nút trò chuyện, bật modal trò chuyện với user vừa click vào
function userTalk() {
  $(".user-talk").unbind("click").on("click", function() {
    let dataChat = $(this).data("uid");
    $("ul.people").find(`a[href="#uid_${dataChat}"]`).click();
    $(this).closest("div.modal").modal("hide");
  });
}

$(document).ready(function() {
  // Hide số thông báo trên đầu icon mở modal contact
  showModalContacts();

  // Bật tắt popup notification
  configNotification();

  // Cấu hình thanh cuộn
  nineScrollLeft();

  // Icon loading khi chạy ajax
  ajaxLoading();

  // Hiển thị hình ảnh grid slide trong modal tất cả ảnh, tham số truyền vào là số ảnh được hiển thị trên 1 hàng.
  // Tham số chỉ được phép trong khoảng từ 1 đến 5
  gridPhotos(5);

  //flash message ở màn hình master
  flashMasterNotify();

  //zoomImageChat();

  //thay đổi kiểu trò chuyện
  changeTypeChat();

  //thay đổi màn hình chat thei userId
  changeScreenChat();

  //convertEmoji();

  //focus vào phần tử đầu tiên của danh sách trò chuyện khi load trang web
  if($("ul.people").find("a").length)
  {
    $("ul.people").find("a")[0].click();
  }

  $("#video-chat-group").bind("click", function() {
    alertify.notify("Tính năng video chat không khả dụng với nhóm trò chuyện", "error", 7);
  });

  notYetConversation();
  userTalk();
});
