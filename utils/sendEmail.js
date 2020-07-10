const nodemailer = require("nodemailer");

// async..await is not allowed in global scope, must use a wrapper
const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    host: `${process.env.MAIL_HOST}`,
    port: `${process.env.MAIL_PORT}`,
    auth: {
      user: `${process.env.MAIL_USER}`,
      pass: `${process.env.MAIL_PASSWORD}`,
    },
  });
  console.log("Email");
  console.log(options);
  // send mail with defined transport object

  const message = {
    from: "trandaosimanh@gmail.com", // sender address
    to: options.email, // list of receivers
    subject: options.subject, // Subject line
    text: options.message, // plain text body
    secure: true,
  };

  console.log("Email2");
  const info = await transporter.sendMail(message);

  console.log("Message sent: %s", info.messageId);
  // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

  // Preview only available when sending through an Ethereal account
  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
};

module.exports = sendEmail;
