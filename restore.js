const backup = require("backup");
var path = require("path");

try {
  backup.restore(
    `${path.resolve()}/website.backup`,
    `C:/Users/Faye Wong/Desktop/backup`
  );
} catch (error) {
  console.log(error);
}
