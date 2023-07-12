import getEnvironment from './environment'
import nodemailer from 'nodemailer'

export default function MailService() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USERNAME, SMTP_PASSWORD } =
    getEnvironment()

  const transport = nodemailer.createTransport({
    // @ts-ignore
    // Not sure what's going on here.
    host: SMTP_HOST,
    port: SMTP_PORT,
    auth: { user: SMTP_USERNAME, pass: SMTP_PASSWORD },
  })

  return {
    /**
     * @param {import('nodemailer').SendMailOptions} mailOptions
     */
    send: async function (mailOptions) {
      await transport.sendMail(mailOptions)
    },
  }
}
