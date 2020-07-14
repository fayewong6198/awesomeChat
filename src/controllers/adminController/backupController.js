const backup = require("backup");
var path = require("path");

const getBackUp = async (req, res, next) => {
  return res.render("main/admin/backup/backup");
};

const postBackUp = async (req, res, next) => {
  try {
    backup.backup(path.resolve(), `${path.resolve()}/website.backup`);
    console.log(2);
    return res.redirect("/admin/backup");
  } catch (error) {
    console.log(3);
    console.log(error);
    return res.redirect("/admin/backup");
  }
};

const postRestore = async (req, res, next) => {
  try {
    backup.restore(
      `${path.resolve()}/website.backup`,
      `C:/Users/Faye Wong/Desktop/backup`
    );
    console.log(2);
    return res.redirect("/admin/backup");
  } catch (error) {
    console.log(error);
    return res.redirect("/admin/backup");
  }
};
module.exports = {
  getBackUp,
  postBackUp,
  postRestore,
};
