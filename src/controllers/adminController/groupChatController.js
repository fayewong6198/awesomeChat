const list = async (req, res, next) => {
  return res.render("main/admin/chatGroups/list", { url: "groupChat" });
};

const retrieve = async (req, res, next) => {
  return res.render("main/admin/chatGroups/retrieve", { url: "groupChat" });
};

module.exports = {
  list,
  retrieve,
};
