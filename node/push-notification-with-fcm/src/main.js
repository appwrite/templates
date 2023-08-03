import { throwIfMissing, sendPushNotification } from './utils.js';

export default async ({ req, res, log, error }) => {
  throwIfMissing(process.env, [
    'FCM_PROJECT_ID',
    'FCM_PRIVATE_KEY',
    'FCM_CLIENT_EMAIL',
    'FCM_DATABASE_URL',
  ]);

  try {
    throwIfMissing(req.body, ['deviceToken', 'message']);
    throwIfMissing(req.body.message, ['title', 'body']);
  } catch (err) {
    return res.json({ ok: false, error: err.message }, 400);
  }

  log(`Sending message to device: ${req.body.deviceToken}`);

  try {
    const response = await sendPushNotification({
      notification: {
        title: req.body.message.title,
        body: req.body.message.body,
      },
      token: req.deviceToken,
    });
    log(`Successfully sent message: ${response}`);

    return res.json({ ok: true, messageId: response });
  } catch (e) {
    error(e);
    return res.json({ ok: false, error: 'Failed to send the message' }, 500);
  }
};
