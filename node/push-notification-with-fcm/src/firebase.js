import * as admin from 'firebase-admin';

class FirebaseService {
  /**
   * @param {import('./environment').default} env
   */
  constructor(env) {
    this.admin = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: env.FIREBASE_PROJECT_ID,
        clientEmail: env.FIREBASE_CLIENT_EMAIL,
        privateKey: env.FIREBASE_PRIVATE_KEY,
      }),
      databaseURL: env.FIREBASE_DATABASE_URL,
    });
  }

  /**
   * @param {admin.messaging.Message} payload
   * @returns {Promise<string>}
   */
  async send(payload) {
    return await admin.messaging().send(payload);
  }
}

export default FirebaseService;
