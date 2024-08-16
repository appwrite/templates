import { throwIfMissing, sendPushNotification } from './utils.js';

throwIfMissing(process.env, [
  'FCM_PROJECT_ID',
  'FCM_PRIVATE_KEY',
  'FCM_CLIENT_EMAIL',
  'FCM_DATABASE_URL',
]);

export default async ({ req, res, log, error }) => {
  try {
    throwIfMissing(req.body, ['deviceToken', 'message']);
    throwIfMissing(req.bodyJson.message, ['title', 'body']);
  } catch (err) {
    return res.json({ ok: false, error: err.message }, 400);
  }

  log(`Sending message to device: ${req.bodyJson.deviceToken}`);

  try {
    const response = await sendPushNotification({
      notification: {
        title: req.bodyJson.message.title,
        body: req.bodyJson.message.body,
      },
      data: req.bodyJson.data ?? {},
      token: req.bodyJson.deviceToken,
    });

    log(`Successfully sent message: ${response}`);

    return res.json({ ok: true, messageId: response });
  } catch (e) {
    error(e);
    return res.json({ ok: false, error: 'Failed to send the message' }, 500);
  }
};
