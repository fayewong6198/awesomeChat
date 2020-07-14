import express from "express";
import ConnectDB from "./config/connectDB";
//import ContactModel from "./model/contact.model";
import configViewEngine from "./config/viewEngine";
import initRoutes from "./routes/web";
import bodyParser from "body-parser";
import flash from "connect-flash";
import session from "./config/session";
import passport from "passport";
import http from "http";
import socketio from "socket.io";
import initSockets from "./sockets/index";
import cookieParser from "cookie-parser";
import configSocketIo from "./config/socketio";
import events from "events";
import * as configApp from "./config/app";

let app = express();

//set max connection event listener
events.EventEmitter.defaultMaxListeners = configApp.app.max_event_listeners;

let server = http.createServer(app);
///
let io = socketio(server);
//kết nối db
ConnectDB();
session.config(app), configViewEngine(app);
app.use(bodyParser.urlencoded({ extended: true }));

app.use(flash());


app.use(cookieParser());
app.use(passport.initialize());
app.use(passport.session());
initRoutes(app);
/////
configSocketIo(io, cookieParser, session.sessionStore);
initSockets(io);

process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
// server.listen(process.env.APP_PORT, process.env.APP_HOST, () => {
//   console.log(`Hello Doanh Doanh, I am running at ${process.env.APP_HOST}:${process.env.APP_PORT}/`);
// });

server.listen(process.env.APP_PORT, () => {
  console.log(
    `Hello Doanh Doanh, I am running at ${process.env.APP_HOST}:${process.env.APP_PORT}/`
  );
});
// import pem from "pem";
// import https from "https";
// pem.config({
//   pathOpenSSL: 'C:\\Program Files\\OpenSSL-Win64\\bin\\openssl'
// })
// pem.createCertificate({ days: 1, selfSigned: true }, function (err, keys) {
//   if (err) {
//     throw err
//   }
//   let app = express();
//   //kết nối db
//   ConnectDB();

//   configSession(app),

//   configViewEngine(app);

//   app.use(bodyParser.urlencoded({extended: true}));

//   app.use(connectFlash());

//   app.use(passport.initialize());
//   app.use(passport.session());

//   initRoutes(app);

//   process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

//   https.createServer({ key: keys.serviceKey, cert: keys.certificate }, app).listen(process.env.APP_PORT, process.env.APP_HOST, () => {
//     console.log(`Hello Doanh Doanh, I am running at ${process.env.APP_HOST}:${process.env.APP_PORT}/`);
//   });
// });
