// const backup = require("backup");
// var path = require("path");

// try {
//   backup.backup(path.resolve(), `${path.resolve()}/website.backup`);
// } catch (error) {
//   console.log(error);
// }

var file_system = require("fs");
var archiver = require("archiver");
const path = require("path");
var output = file_system.createWriteStream(`${path.resolve()}/backup/cc.zip`);
var archive = archiver("zip");

output.on("close", function () {
  console.log(archive.pointer() + " total bytes");
  console.log(
    "archiver has been finalized and the output file descriptor has closed."
  );
});

archive.on("error", function (err) {
  throw err;
});

archive.pipe(output);

// append files from a sub-directory and naming it `new-subdir` within the archive (see docs for more options):
archive.directory(`${path.resolve()}`, false);
archive.finalize();
