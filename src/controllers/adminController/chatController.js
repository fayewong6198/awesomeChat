const list = async (req, res, next) => {
  return res.render("main/admin/chats/list", { url: "chat" });
};

const retrieve = async (req, res, next) => {
  return res.render("main/admin/chats/retrieve", { url: "chat" });
};

module.exports = {
  list,
  retrieve,
};
