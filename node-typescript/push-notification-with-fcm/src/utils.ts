import admin from 'firebase-admin';

throwIfMissing(process.env, [
  'FCM_PROJECT_ID',
  'FCM_PRIVATE_KEY',
  'FCM_CLIENT_EMAIL',
]);

// initialize firebase app
admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FCM_PROJECT_ID,
    clientEmail: process.env.FCM_CLIENT_EMAIL,
    privateKey: process.env.FCM_PRIVATE_KEY,
  }),
});

/**
 * Throws an error if any of the keys are missing from the object
 * @param obj - The object to check
 * @param keys - The keys to check for
 * @throws {Error}
 */
export function throwIfMissing(obj: Record<string, any>, keys: string[]): void {
  const missing: string[] = [];
  for (let key of keys) {
    if (!(key in obj) || !obj[key]) {
      missing.push(key);
    }
  }
  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(', ')}`);
  }
}

/**
 * Sends a push notification
 * @param payload - The message payload
 * @returns {Promise<string>}
 */
export async function sendPushNotification(
  payload: admin.messaging.Message
): Promise<string> {
  try {
    return await admin.messaging().send(payload);
  } catch (e) {
    throw new Error('Error on messaging');
  }
}
