// require modules
var fs = require("fs");
var archiver = require("archiver");

// create a file to stream archive data to.
var output = fs.createWriteStream(__dirname + "/cc.zip");
var archive = archiver("zip", {
  zlib: { level: 9 }, // Sets the compression level.
});

// listen for all archive data to be written
output.on("close", function () {
  console.log(archive.pointer() + " total bytes");
  console.log(
    "archiver has been finalized and the output file descriptor has closed."
  );
});

// good practice to catch warnings (ie stat failures and other non-blocking errors)
archive.on("warning", function (err) {
  if (err.code === "ENOENT") {
    // log warning
  } else {
    // throw error
    throw err;
  }
});

// good practice to catch this error explicitly
archive.on("error", function (err) {
  throw err;
});

// pipe archive data to the file
archive.pipe(output);

archive.glob("**/*", { ignore: ["*.zip"] });
