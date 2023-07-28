import * as admin from 'firebase-admin';

class FirebaseService {
  constructor() {
    this.admin = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY,
      }),
      databaseURL: process.env.FIREBASE_DATABASE_URL,
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
