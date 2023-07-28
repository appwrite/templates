import FirebaseService from './firebase.js';
import { throwIfMissing } from './utils.js';

export default async ({ req, res, log, error }) => {
  throwIfMissing(process.env, [
    'FIREBASE_PROJECT_ID',
    'FIREBASE_PRIVATE_KEY',
    'FIREBASE_CLIENT_EMAIL',
    'FIREBASE_DATABASE_URL',
  ]);

  if (
    req.method !== 'POST' ||
    req.headers['content-type'] !== 'application/json'
  ) {
    return res.send('Invalid request.', 400);
  }

  const firebase = new FirebaseService();

  try {
    throwIfMissing(req.body, ['deviceToken', 'message']);
    throwIfMissing(req.body.message, ['title', 'body']);
  } catch (err) {
    return res.json({ ok: false, error: err.message }, 400);
  }

  log(`Sending message to device: ${req.body.deviceToken}`);

  const payload = {
    notification: {
      title: req.body.message.title,
      body: req.body.message.body,
    },
    token: req.deviceToken,
  };

  try {
    const response = await firebase.send(payload);
    log(`Successfully sent message: ${response}`);

    return res.json({ messageId: response });
  } catch (e) {
    error(e);
    return res.send('Failed to send the message.', 500);
  }
};
