const nodemailer = require("nodemailer");

let smtp_config = {
  host: "",
  port: 587,
  secure: false,
  auth: {
    user: "",
    pass: "",
  },
};

if (process.env.NODE_ENV === "development") {
  const account = nodemailer.createTestAccount();

  smtp_config = {
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: {
      user: account.user,
      pass: account.pass,
    },
  };
} else {
  smtp_config = {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  };
}
//console.log("smtp_config: ", account);

class MailService {
  constructor() {
    this.transporter = nodemailer.createTransport(smtp_config);
  }

  async sendActivationMail(to, link) {
    try {
      const result = await this.transporter.sendMail({
        from: process.env.SMTP_USER,
        to,
        subject: `Активация аккаунта на  ${process.env.API_URL}`,
        text: "",
        html: `
            <div>
                <h1>Для подтверждения регистрации в программе "Семейное дерево" перейдите по ссылке </h1>
                <a href="${link}">${link}</a>
            </div>
            `,
      });
      console.log("Отправка почты: ", result);
      res.status(200).json({ email });
    } catch (error) {
      console.log("Ошибка отправки почты: ", error);
      res.status(500).json({ error: "Unable to send verification email" });
    }
  }
}

module.exports = new MailService();
