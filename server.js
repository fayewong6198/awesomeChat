var express = require("express");
var app = express();

var hostname = "localhost";
var port = 8017;

app.get("/helloworld", (req, res) => {
  res.send("<h1>Hello world !!!</h1>");
});

app.listen(port, hostname, () => {
  console.log(`Hello Doanh Doanh, I am running at ${ hostname }:${ port }/`);
});
