import express from "express";
import ConnectDB from "./config/connectDB";
import ContactModel from "./model/contact.model";

let app = express();

ConnectDB();

app.get("/test-database", async (req, res) => {
  try {
    let item = {
      userId: "sydvo",
      contactId: "952001",
    };
    let contact = await ContactModel.createNew(item);
    res.send(contact);
  } catch (err) {
    console.log(err);
  }
  res.send("<h1>Hello world !!!</h1>");
});

app.listen(process.env.APP_PORT, process.env.APP_HOST, () => {
  console.log(`Hello Doanh Doanh, I am running at ${process.env.APP_HOST}:${process.env.APP_PORT}/`);
});
