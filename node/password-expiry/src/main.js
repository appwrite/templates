import { throwIfMissing } from './utils.js';
import { Client, Users, Query } from 'node-appwrite';
import nodemailer from 'nodemailer';

export default async ({ res, log, error }) => {
  throwIfMissing(process.env, [
    'APPWRITE_FUNCTION_PROJECT_ID',
    'APPWRITE_API_KEY',
    'MAX_PASSWORD_AGE',
    'RESET_PASSWORD_URL',
    'STMP_DSN',
  ]);

  const client = new Client();
  client
    .setEndpoint(
      process.env.APPWRITE_ENDPOINT ?? 'https://cloud.appwrite.io/v1'
    )
    .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

  const users = new Users(client);

  const expiryPeriodMs = 1000;
  const beforeTimeMs = Date.now() - expiryPeriodMs;
  const beforeDateTime = new Date(beforeTimeMs).toISOString();

  const usersWithExpiredPasswords = await users.list([
    Query.lessThanEqual('passwordUpdate', beforeDateTime),
  ]);

  /** 
  const usersWithOutdatedHash = await users.list([
    Query.equal('hash', ['phpass', 'md5', 'sha1']),
  ]);
  */

  const dsn = new URL(process.env.STMP_DSN);

  log(dsn.username);

  const transport = nodemailer.createTransport({
    host: dsn.hostname,
    port: dsn.port || 587,
    auth: {
      user: dsn.username.replace(/%40/g, '@'),
      pass: dsn.password,
    },
  });

  const usersToNotify = [
    //...usersWithOutdatedHash.users,
    ...usersWithExpiredPasswords.users,
  ];

  if (usersToNotify.length === 0) {
    log('Exiting - no users to notify');
    return res.json({
      ok: true,
    });
  }

  let count = 0;
  for (const user of usersToNotify) {
    try {
      await transport.sendMail({
        from: dsn.searchParams.get('from'),
        to: 'luke@appwrite.io',
        subject: 'Your password needs to be updated',
        text: `Hi ${
          user.name
        },\n\nYour password needs to be updated. Please log in to ${
          process.env.RESET_PASSWORD_URL
        } to update your password.\n\nThanks,\n${dsn.searchParams.get('from')}`,
      });
      count += 1;
    } catch (err) {
      error(`Failed to send email to user with id ${user.$id}: ${err}`);
    }
  }

  log(`Sent ${count} email to users`);

  return res.json({
    ok: true,
  });
};
