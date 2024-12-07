import { throwIfMissing, sendPushNotification } from './utils.js';

interface Request {
  body: {
    deviceToken: string;
    message: {
      title: string;
      body: string;
    };
    data?: Record<string, any>;
  };
  bodyJson: {
    deviceToken: string;
    message: {
      title: string;
      body: string;
    };
    data?: Record<string, any>;
  };
}

interface Response {
  json: (body: Record<string, any>, status?: number) => void;
}

interface Logger {
  (message: string): void;
}

interface ErrorLogger {
  (error: Error): void;
}

interface Context {
  req: Request;
  res: Response;
  log: Logger;
  error: ErrorLogger;
}

throwIfMissing(process.env, [
  'FCM_PROJECT_ID',
  'FCM_PRIVATE_KEY',
  'FCM_CLIENT_EMAIL',
  'FCM_DATABASE_URL',
]);

export default async ({ req, res, log, error }: Context) => {
  try {
    throwIfMissing(req.bodyJson, ['deviceToken', 'message']);
    throwIfMissing(req.bodyJson.message, ['title', 'body']);
  } catch (err) {
    return res.json({ ok: false, error: (err as Error).message }, 400);
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
    error(e as Error);
    return res.json({ ok: false, error: 'Failed to send the message' }, 500);
  }
};