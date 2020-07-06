function videoChat(divId) {
  $(`#video-chat-${divId}`).unbind("click").on("click", function() {
    let targetId = $(this).data("chat");
    let callerName = $("#navbar-username").text();

    let dataToEmit = {
      listenerId: targetId,
      callerName: callerName
    };
    //B1 kiểm tra listener online ?
    socket.emit("caller-check-listener-online-or-not", dataToEmit);
  });
}

function playVideoStream(videoTagId, stream) {
  let video = document.getElementById(videoTagId);
  video.srcObject = stream;
  video.onloadeddata = function() {
    video.play();
  };
}

function closeVideoStream(stream) {
  return stream.getTracks().forEach(track => track.stop());
}

$(document).ready(function() {
  //B2
  socket.on("server-send-listener-is-offline", function() {
    alertify.notify("Người dùng này hiện không trực tuyến!", "error", 7);
  });

  let iceServerList = $("#ice-server-list").val();

  let getPeerId = "";
  const peer = new Peer({
    key: "peerjs",
    host: "peerjs-server-trungquandev.herokuapp.com",
    secure: true,
    port: 443,
    config: {"iceServers": JSON.parse(iceServerList)}
    //debug: 3
  });
  peer.on("open", function(peerId) {
    getPeerId = peerId;
  });

  //B3 of listener
  socket.on("server-request-peer-if-of-listener", function(response) {
    let listenerName = $("#navbar-username").text();
    let dataToEmit = {
      callerId: response.callerId,
      listenerId: response.listenerId,
      callerName: response.callerName,
      listenerName: listenerName,
      listenerPeerId: getPeerId
    };

    //B4
    socket.emit("listener-emit-peer-id-to-server", dataToEmit);
  });

  let timerInterval;
  //B5 of caller
  socket.on("server-send-peer-if-of-listener-to-caller", function(response) {
    let dataToEmit = {
      callerId: response.callerId,
      listenerId: response.listenerId,
      callerName: response.callerName,
      listenerName: response.listenerName,
      listenerPeerId: response.listenerPeerId
    };
    //B6 of caller
    socket.emit("caller-request-call-to-server", dataToEmit);

    Swal.fire({
      title: `Đang gọi cho &nbsp; <span style="color: #2ECC71;">${response.listenerName}</span> &nbsp; <i class="fa fa-volume-control-phone"></i>`,
      html: `
              Thời gian: <strong style="color: #d43f3a;"></strong> giây. <br></br>
              <button id="btn-cancel-call" class="btn btn-danger"> Hủy cuộc gọi
              </button>
            `,
      backdrop: "rgba(85, 85, 85, 0.4)",
      width: "52rem",
      allowOutsideClick: false,
      timer: 30000, //30s
      onBeforeOpen: () => {
        $("#btn-cancel-call").unbind("click").on("click", function() {
          Swal.close();
          clearInterval(timerInterval);

          //B7 of caller
          socket.emit("caller-cancel-request-call-to-server", dataToEmit);
        });

        if (Swal.getContent().querySelector !== null) {
          Swal.showLoading();
          timerInterval = setInterval(() => {
            Swal.getContent().querySelector("strong").textContent = Math.ceil(Swal.getTimerLeft() / 1000);
          }, 1000);
        }  
      },
      onOpen: () => {
        //B12 of caller server gửi thông báo về cho caller khi listener từ chối cuộc gọi
        socket.on("server-send-reject-call-to-caller", function(response) {
          Swal.close();
          clearInterval(timerInterval);

          Swal.fire({
            type: "info",
            title: `<span style="color: #2ECC71;">${response.listenerName}</span> &nbsp; hiện tại không thể nghe máy.`,
            backdrop: "rgba(85, 85, 85, 0.4)",
            width: "52rem",
            allowOutsideClick: false,
            confirmButtonColor: "#2ECC71",
            confirmButtonText: "xác nhận!"
          });
        });
      },
      onClose: () => {
        clearInterval(timerInterval);
      }
    }).then((result) => {
        return false;
    });
  });

  //B8 of listener
  socket.on("server-send-request-call-to-listener", function(response) {
    let dataToEmit = {
      callerId: response.callerId,
      listenerId: response.listenerId,
      callerName: response.callerName,
      listenerName: response.listenerName,
      listenerPeerId: response.listenerPeerId
    };

    Swal.fire({
      title: `<span style="color: #2ECC71;">${response.callerName}</span> &nbsp; muốn gọi video với bạn &nbsp; <i class="fa fa-volume-control-phone"></i>`,
      html: `
              Thời gian: <strong style="color: #d43f3a;"></strong> giây. <br></br>
              <button id="btn-reject-call" class="btn btn-danger"> Từ chối
              </button>
              <button id="btn-accept-call" class="btn btn-success"> Trò chuyện
              </button>
            `,
      backdrop: "rgba(85, 85, 85, 0.4)",
      width: "52rem",
      allowOutsideClick: false,
      timer: 30000, //30s
      onBeforeOpen: () => {
        $("#btn-reject-call").unbind("click").on("click", function() {
          Swal.close();
          clearInterval(timerInterval);

          //B10 of listener gửi từ chối gọi video
          socket.emit("listener-reject-request-call-to-server", dataToEmit);
        });

        $("#btn-accept-call").unbind("click").on("click", function() {
          Swal.close();
          clearInterval(timerInterval);

          //B11 of listener chấp nhận tham gia trò chuyện video của caller
          socket.emit("listener-accept-request-call-to-server", dataToEmit);
        });

        if (Swal.getContent().querySelector !== null) {
          Swal.showLoading();
          timerInterval = setInterval(() => {
            Swal.getContent().querySelector("strong").textContent = Math.ceil(Swal.getTimerLeft() / 1000);
          }, 1000);
        }
      },
      onOpen: () => {
        //B9 of listener đóng swal hiển thị cuộc gọi đến bên listener khi caller hủy cuộc gọi
        socket.on("server-send-cancel-request-call-to-listener", function(response) {
          Swal.close();
          clearInterval(timerInterval);
        });
      },
      onClose: () => {
        clearInterval(timerInterval);
      }
    }).then((result) => {
        return false;
    });
  });

  
  //B13 of caller
  socket.on("server-send-accept-call-to-caller", function(response) {
    Swal.close();
    clearInterval(timerInterval);

    //peerjs.com Media calls - call
    //fix lỗi https://stackoverflow.com/a/27552062
    let getUserMedia = (navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia).bind(navigator);
    
    getUserMedia({video: true, audio: true}, function(stream) {
      $("#streamModal").modal("show");

      //play caller's stream in local
      playVideoStream("local-stream", stream);
      //call to listener
      let call = peer.call(response.listenerPeerId, stream);
      //listen and play listener's stream
      call.on("stream", function(remoteStream) {
        //play listener's stream
        playVideoStream("remote-stream", remoteStream);
      });

      //close modal and remove stream
      $("#streamModal").on("hidden.bs.modal", function() {
        closeVideoStream(stream);

        Swal.fire({
          type: "info",
          title: `Đã kết thúc cuộc gọi video với &nbsp; <span style="color: #2ECC71;">${response.listenerName}</span>`,
          backdrop: "rgba(85, 85, 85, 0.4)",
          width: "52rem",
          allowOutsideClick: false,
          confirmButtonColor: "#2ECC71",
          confirmButtonText: "xác nhận!"
        });
      });
    }, function(err) {
      if (err.toString === "NotAllowedError: Permission denied") {
        alertify.notify("Bạn cần bật quyền truy cập nghe gọi trên trình duyệt.", "error", 7);
      }

      if (err.toString === "NotFoundError: Requested device not found") {
        alertify.notify("Không tìm thấy thiết bị nghe gọi trên máy tính của bạn.", "error", 7);
      }
    });
  });

  
  //B14 of listener
  //peerjs.com Media calls - answer
  socket.on("server-send-accept-call-to-listener", function(response) {
    Swal.close();
    clearInterval(timerInterval);

    let getUserMedia = (navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia).bind(navigator);

    peer.on("call", function(call) {
      getUserMedia({video: true, audio: true}, function(stream) {
        $("#streamModal").modal("show");

        //play listener's stream in local
        playVideoStream("local-stream", stream);

        call.answer(stream); // Answer the call with an A/V stream.
        call.on("stream", function(remoteStream) {
          //play caller's stream
          playVideoStream("remote-stream", remoteStream);
        });

        //close modal and remove stream
        $("#streamModal").on("hidden.bs.modal", function() {
          closeVideoStream(stream);

          Swal.fire({
            type: "info",
            title: `Đã kết thúc cuộc gọi video với &nbsp; <span style="color: #2ECC71;">${response.callerName}</span>`,
            backdrop: "rgba(85, 85, 85, 0.4)",
            width: "52rem",
            allowOutsideClick: false,
            confirmButtonColor: "#2ECC71",
            confirmButtonText: "xác nhận!"
          });
        });
      }, function(err) {
        if (err.toString === "NotAllowedError: Permission denied") {
          alertify.notify("Bạn cần bật quyền truy cập nghe gọi trên trình duyệt.", "error", 7);
        }

        if (err.toString === "NotFoundError: Requested device not found") {
          alertify.notify("Không tìm thấy thiết bị nghe gọi trên máy tính của bạn.", "error", 7);
        }
      });
    });
  });
});