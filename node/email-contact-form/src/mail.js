import nodemailer from 'nodemailer';

class MailService {
  /**
   * @param {import('./environment').default} env
   */
  constructor(env) {
    this.env = env;

    this.transport = nodemailer.createTransport({
      // @ts-ignore
      // Not sure what's going on here.
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      auth: { user: env.SMTP_USERNAME, pass: env.SMTP_PASSWORD },
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
