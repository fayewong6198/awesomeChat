export const transValidation = {
  email_incorrect: "Email phải có dạng abc@gmail.com",
  gender_incorrect: "Chọn giới tính bị lỗi",
  password_incorrect: "Mật khẩu phải chứa ít nhất 8 ký tự, bao gồm chữ Hoa, chữ thường, chữ số và ký tự đặc biệt",
  password_confirmation_incorrect: "Mật khẩu không trùng khớp",
  update_username: "Tên người dùng giới hạn trong khoảng 3-17 ký tự và không được phép chứa ký tự đặt biệt.",
  update_gender: "Dữ liệu giới tính có vấn đề.",
  update_address: "Địa chỉ giới hạn trong khoảng 3-30 ký tự.",
  update_phone: "Phải bắt đầu từ số 0 và phải đúng 10 ký tự.",
  keyword_find_user: "Lỗi từ khóa tìm kiếm, không chấp nhận ký tự đặc biệt!",
  message_text_emoji_incorrect: "Tin nhắn không hợp lệ. Tối thiểu 1 ký tự, tối đa 500 ký tự.",
  add_new_group_users_incorrect: "Vui lòng chọn bạn bè để thêm vào nhóm, tối thiếu 2 người bạn.",
  add_new_group_name_incorrect: "Đặt tên nhóm giới hạn 5-30 ký tự và không được chứa ký tự đặt biệt.",
};

export const transErrors = {
  account_in_use: "Email này đã được sử dụng.",
  account_removed: "Tài khoản này đã bị gỡ khỏi hệ thống.",
  account_not_active: "Tài khoản này chưa được kích hoạt.",
  account_undefined: "Tài khoản này không tồn tại.",
  token_undefined: "Link này không tồn tại.",
  login_failed: "Sai tài khoản hoặc mật khẩu.",
  server_error: "Có lỗi ở phía server.",
  avatar_type: "Kiểu file không hợp lệ.",
  avatar_size: "Kích thước tối đa cho phép là 1 MB.",
  user_current_password_failed: "Mật khẩu hiện tại không chính xác.",
  conversation_not_found: "Cuộc trò chuyện không tồn tại.",
  image_message_type: "Kiểu file không hợp lệ.",
  image_message_size: "Kích thước tối đa cho phép là 1 MB.",
  attachment_message_size: "Kích thước tối đa cho phép là 1 MB."
};

export const transSuccess = {
  userCreated: (userEmail) => {
    return `Tài khoản <strong>${userEmail}</strong> đã được tạo, vui lòng kiểm tra email để kích hoạt tài khoản.`;
  },
  account_actived: "Kích hoạt tài khoản thành công.",
  loginSuccess: (username) => {
    return `Xin chào ${username}, chúc bạn online vui vẻ.`;
  },
  logout_success: "Đăng xuất tài khoản thành công.",
  user_info_updated: "Cập nhật thông tin cá nhân thành công.",
  user_password_updated: "Cập nhật mật khẩu mới thành công."
};

export const transMail = {
  subject: "Xác nhận kích hoạt tài khoản Chat của bạn.",
  template: (linkVerify) => {
    return `
      <h2>Chúc mừng bạn đã đăng ký thành công tài khoản trên web Chat của chúng tôi.</h2>
      <h3>Vui lòng click vào liên kết bên dưới để xác nhận kích hoạt tài khoản.</h3>
      <h3><a href="${linkVerify}" target="blank">${linkVerify}</a></h3>
    `;
  },
  send_falied: "Có lỗi trong quá trình gửi email. Vui lòng liên hệ bộ phận hỗ trợ."
};
