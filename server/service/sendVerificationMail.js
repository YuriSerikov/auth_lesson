const nodemailer = require("nodemailer");

const sendVerificationMail = async (to, link) => {
  try {
    const testEmailAccount = await nodemailer.createTestAccount();
    let transporter;
    let from;

    if (process.env.NODE_ENV === "development") {
      from = "smtp.ethereal.email";
      transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false, // true for 465, false for other ports; false for 587
        auth: {
          user: testEmailAccount.user, // generated ethereal user
          pass: testEmailAccount.pass, // generated ethereal password
        },
      });
    } else {
      from = "serikovreg.ru@mail.ru";
      transporter = nodemailer.createTransport({
        host: "smtp.mail.ru",
        port: 465,
        secure: true, // true for 465, false for other ports
        auth: {
          user: "serikovreg.ru@mail.ru", // generated ethereal user
          pass: "e1hvmziv183xyjSgAqRa", // generated ethereal password
        },
      });
    }

    const mailOptions = {
      from: from, // sender address
      to: to, // list of receivers
      subject: "Подтверждение регистрации", // Subject line
      text: "", // plain text body
      html: `
            <div>
                <h1>Для подтверждения регистрации в программе "Семейное дерево" перейдите по ссылке </h1>
                <a href="${link}">${link}</a>
            </div>
            `, // html body
    };
    console.log("mailOptions:", mailOptions);
    // send mail with defined transport object
    const info = await transporter.sendMail(mailOptions);
    console.log("Отправлено сообщение: %s", info.messageId);
  } catch (error) {
    console.log("Ошибка отправки почты: ", error);

    throw error;
  }
};
module.exports = sendVerificationMail;
