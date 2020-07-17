var backup = require("mongodb-backup");

console.log(
  `${process.env.DB_CONNECTION}://${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`
);
backup({
  uri: `mongodb://localhost.com:27017/awesome_chat`, // mongodb://<dbuser>:<dbpassword>@<dbdomain>.mongolab.com:<dbport>/<dbdatabase>
  root: `${__dirname}/cc`,
  // collections: ["users"], // save this collection only
});
console.log("done");
