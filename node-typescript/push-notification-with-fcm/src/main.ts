import { sendPushNotification, throwIfMissing } from './utils.js';
import admin from 'firebase-admin';
type Context = {
  req: any;
  res: any;
  log: (msg: any) => void;
  error: (msg: any) => void;
};

export default async ({ req, res, log, error }: Context) => {
  try {
    throwIfMissing(process.env, [
      'FCM_PROJECT_ID',
      'FCM_PRIVATE_KEY',
      'FCM_CLIENT_EMAIL',
      'FCM_DATABASE_URL',
    ]);

    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FCM_PROJECT_ID,
        clientEmail: process.env.FCM_CLIENT_EMAIL,
        privateKey: process.env.FCM_PRIVATE_KEY,
      }),
      databaseURL: process.env.FCM_DATABASE_URL,
    });

    throwIfMissing(req.body, ['deviceToken', 'message']);
    throwIfMissing(req.body.message, ['title', 'body']);
  } catch (err) {
    error(err);
    if (err instanceof Error) res.json({ ok: false, error: err.message }, 400);
  }

  try {
    const payload = JSON.parse(req.body);
    log(`Sending message to device: ${payload.deviceToken}`);

    const response = await sendPushNotification({
      notification: {
        title: payload.message.title,
        body: payload.message.body,
      },
      token: payload.deviceToken,
    });
    log(`Successfully sent message: ${response}`);

    return res.json({ ok: true, messageId: response });
  } catch (e) {
    error(e);
    return res.json({ ok: false, error: 'Failed to send the message' }, 500);
  }
};
