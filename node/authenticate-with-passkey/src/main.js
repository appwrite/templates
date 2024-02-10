import {
  getStaticFile,
  throwIfMissing,
  convertChallenge,
  getNewChallenge,
  getRegistrationCredentials
} from './utils.js';
import AppwriteService from './appwrite.js';
import * as SimpleWebAuthnServer from '@simplewebauthn/server';

export default async ({ req, res, log }) => {
  throwIfMissing(process.env, [
    'APPWRITE_API_KEY',
    'ALLOWED_ORIGIN'
  ]);

  const appwrite = new AppwriteService();

  if (req.path === '/' && req.method === 'GET') {
    return res.send(getStaticFile('index.html'), 200, {
      'Content-Type': 'text/html; charset=utf-8',
    });
  }

  if (req.path === '/register/start' && req.method === 'POST') {
    try {
      throwIfMissing(req.body, ['email']);
    } catch (error) {
      log(error);
      return res.send('Please provide email.', 400);
    }

    const email = req.body.email;

    const token = getNewChallenge();
    const converted = convertChallenge(token);

    const user = await appwrite.prepareUser(email);
    const challenge = await appwrite.createChallenge(user.$id, converted);

    const rpId = process.env.RP_ID ?? 'localhost';
    const rpName = process.env.RP_NAME ?? 'webauthn-appwrite';

    return res.json({
      challengeId: challenge.$id,
      challenge: token,
      rp: { id: rpId, name: rpName },
      user: { id: user.$id, name: email, displayName: email },
      pubKeyCredParams: [
        { type: 'public-key', alg: -7 },
        { type: 'public-key', alg: -257 },
      ],
      authenticatorSelection: {
        authenticatorAttachment: 'platform',
        userVerification: 'required',
        residentKey: 'preferred',
        requireResidentKey: false,
      }
    });
  }

  if (req.path === '/register/finish' && req.method === 'POST') {
    try {
      throwIfMissing(req.body, ['challengeId', 'data']);
    } catch (error) {
      log(error);
      return res.send('Please provide challengeId and data.', 400);
    }

    const { challengeId, data } = req.body;

    let challenge;

    try {
      challenge = await appwrite.getChallenge(challengeId);
    } catch(error) {
      log(error);
      return res.send('Challenge not found. Please start over.', 400);
    }

    let verification;
    try {
        verification = await SimpleWebAuthnServer.verifyRegistrationResponse({
            response: data,
            expectedChallenge: challenge.token,
            expectedOrigin: process.env.ALLOWED_ORIGIN
        });
    } catch (error) {
        log(error);
        return res.send('Could not finish registration process.', 400);
    }

    const { verified, registrationInfo } = verification;

    if(!verified) {
      log(verification);
      return res.send('Unexpected server error.', 500);
    }

    const credentials = getRegistrationCredentials(registrationInfo);
    await appwrite.createCredentials(challenge.userId, credentials);
    await appwrite.deleteChallenge(challenge.$id);

    return res.send('OK', 200);
  }

  return res.send('Not found.', 404);
};
