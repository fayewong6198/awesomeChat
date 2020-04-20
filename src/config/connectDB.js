import mongoose from "mongoose";
import bluebird from "bluebird";

const {resolve} = require('path');
require('dotenv').config({path: resolve(__dirname,"../../sh/.env")});
//const path = require('path');
//require('dotenv').config({path:path.resolve(__dirname+'/./../../.env')});
/**
 * connect mongodb
 */
let connectDB = () => {
  mongoose.Promise = bluebird;

  let URI = `${process.env.DB_CONNECTION}://${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;

  console.log(URI);

  return mongoose.connect(URI, {useMongoClient: true});
};

module.exports = connectDB;


