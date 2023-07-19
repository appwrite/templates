import EnvironmentService from './environment.js';
import FirebaseService from './firebase.js';

export default async ({ req, res, log, error }) => {
  if (
    req.method !== 'POST' ||
    req.headers['content-type'] !== 'application/json'
  ) {
    return res.send('Invalid request.', 400);
  }

  const environment = EnvironmentService();
  const firebase = FirebaseService(environment);

  const { deviceToken, message } = req.body;
  if (!deviceToken || !message) {
    error('Device token and message are required.');
    return res.send('Device token and message are required.', 400);
  }

  log(`Sending message to device: ${deviceToken}`);

  const payload = {
    notification: {
      title: message.title,
      body: message.body,
    },
    token: deviceToken,
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
