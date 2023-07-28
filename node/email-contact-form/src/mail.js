import nodemailer from 'nodemailer';

class MailService {
  constructor() {
    this.transport = nodemailer.createTransport({
      // @ts-ignore
      // Not sure what's going on here.
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      auth: {
        user: process.env.SMTP_USERNAME,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }

  /**
   * @param {import('nodemailer').SendMailOptions} mailOptions
   */
  async send(mailOptions) {
    await this.transport.sendMail(mailOptions);
  }
}

export default MailService;
