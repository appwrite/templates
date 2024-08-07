import {
  getStaticFile,
  throwIfMissing
} from './utils.js';
import AppwriteService from './appwrite.js';
import * as SimpleWebAuthnServer from '@simplewebauthn/server';
import * as SimpleWebAuthnServerHelpers from '@simplewebauthn/server/helpers';

export default async ({ req, res, log }) => {
  throwIfMissing(process.env, [
    'APPWRITE_API_KEY',
    'ALLOWED_HOSTNAME'
  ]);

  const corsHeaders = {
    'Access-Control-Allow-Origin': 'https://' + process.env.ALLOWED_HOSTNAME,
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Origin, Content-Type'
  };

  const appwrite = new AppwriteService();

  if (req.method === 'OPTIONS') {
    return res.send('', 200, corsHeaders);
  }

  if (req.path === '/' && req.method === 'GET') {
    return res.send(getStaticFile('index.html'), 200, {
      'Content-Type': 'text/html; charset=utf-8',
      ...corsHeaders
    });
  }

  if (req.path === '/v1/challenges' && req.method === 'POST') {
    try {
      throwIfMissing(req.body, ['email']);
    } catch (error) {
      log(error);
      return res.send('Please provide email.', 400, corsHeaders);
    }

    const user = await appwrite.prepareUser(req.body.email);

    const credential = await appwrite.getCredential(user.$id);
    if (credential) {
      return res.send('You already have passkey. Please sign in.', 400, corsHeaders);
    }

    const options = await SimpleWebAuthnServer.generateRegistrationOptions({
      rpName: 'Passkeys Demo (Appwrite)',
      rpID: process.env.ALLOWED_HOSTNAME,
      userID: user.$id,
      userName: req.body.email,
      userDisplayName: req.body.email,
      attestationType: 'none',
      authenticatorSelection: {
        residentKey: 'preferred',
        userVerification: 'preferred',
        authenticatorAttachment: 'platform',
      },
    });

    const challenge = await appwrite.createChallenge(user.$id, options.challenge);

    return res.json({
      challengeId: challenge.$id,
      options
    }, 200, corsHeaders);
  }

  if (req.path === '/v1/challenges' && req.method === 'PUT') {
    try {
      throwIfMissing(req.body, ['challengeId', 'registration']);
    } catch (error) {
      log(error);
      return res.send('Please provide challengeId and registration.', 400, corsHeaders);
    }

    const { challengeId, registration } = req.body;

    let challenge;

    try {
      challenge = await appwrite.getChallenge(challengeId);
    } catch (error) {
      log(error);
      return res.send('Challenge not found. Please start over.', 400, corsHeaders);
    }

    let verification;
    try {
      verification = await SimpleWebAuthnServer.verifyRegistrationResponse({
        response: registration,
        expectedChallenge: challenge.token,
        expectedOrigin: 'https://' + process.env.ALLOWED_HOSTNAME,
        expectedRPID: process.env.ALLOWED_HOSTNAME
      });
    } catch (error) {
      log(error);
      return res.send('Could not finish registration process.', 400, corsHeaders);
    }

    const { verified, registrationInfo } = verification;

    if (!verified) {
      log(verification);
      return res.send('Incorrect passkey.', 500, corsHeaders);
    }

    await appwrite.createCredentials(challenge.userId, {
      credentialID: SimpleWebAuthnServerHelpers.isoUint8Array.toHex(registrationInfo.credentialID),
      credentialPublicKey: SimpleWebAuthnServerHelpers.isoUint8Array.toHex(registrationInfo.credentialPublicKey),
      counter: registrationInfo.counter,
      credentialDeviceType: registrationInfo.credentialDeviceType,
      credentialBackedUp: registrationInfo.credentialBackedUp,
      transports: registration.response.transports
    });
    await appwrite.deleteChallenge(challenge.$id);

    return res.send('OK', 200, corsHeaders);
  }

  if (req.path === '/v1/tokens' && req.method === 'POST') {
    try {
      throwIfMissing(req.body, ['email']);
    } catch (error) {
      log(error);
      return res.send('Please provide email.', 400, corsHeaders);
    }

    const user = await appwrite.prepareUser(req.body.email);

    const credential = await appwrite.getCredential(user.$id);
    if(!credential) {
      return res.send('You do not have passkey yet. Please sign up.', 400, corsHeaders);
    }

    const authenticator = JSON.parse(credential.credentials);

    const options = await SimpleWebAuthnServer.generateAuthenticationOptions({
      rpID: process.env.ALLOWED_HOSTNAME,
      userVerification: 'preferred',
      allowCredentials: [{
        id: SimpleWebAuthnServerHelpers.isoUint8Array.fromHex(authenticator.credentialID),
        type: 'public-key',
        transports: authenticator.transports
      }]
    });

    const challenge = await appwrite.createChallenge(user.$id, options.challenge);

    return res.json({
      challengeId: challenge.$id,
      options
    }, 200, corsHeaders);
  }

  if (req.path === '/v1/tokens' && req.method === 'PUT') {
    try {
      throwIfMissing(req.body, ['challengeId', 'authentication']);
    } catch (error) {
      log(error);
      return res.send('Please provide challengeId and authentication.', 400, corsHeaders);
    }

    const { challengeId, authentication } = req.body;

    let challenge;
    try {
      challenge = await appwrite.getChallenge(challengeId);
    } catch (error) {
      log(error);
      return res.send('Challenge not found. Please start over.', 400, corsHeaders);
    }

    const credential = await appwrite.getCredential(challenge.userId);
    if(!credential) {
      return res.send('You do not have passkey yet. Please sign up.', 400, corsHeaders);
    }

    let verification;
    try {
      const authenticator = JSON.parse(credential.credentials);
      authenticator.credentialID = SimpleWebAuthnServerHelpers.isoUint8Array.fromHex(authenticator.credentialID);
      authenticator.credentialPublicKey = SimpleWebAuthnServerHelpers.isoUint8Array.fromHex(authenticator.credentialPublicKey);

      verification = await SimpleWebAuthnServer.verifyAuthenticationResponse({
        response: authentication,
        expectedChallenge: challenge.token,
        expectedOrigin: 'https://' + process.env.ALLOWED_HOSTNAME,
        expectedRPID: process.env.ALLOWED_HOSTNAME,
        authenticator
      });
    } catch (error) {
      log(error);
      log(error.message);
      log(error.stack);
      return res.send('Could not finish authentication process.', 400, corsHeaders);
    }

    const { verified } = verification;

    if (!verified) {
      log(verification);
      return res.send('Incorrect passkey.', 400, corsHeaders);
    }

    const token = await appwrite.createSessionToken(challenge.userId);

    return res.json({
      secret: token.secret,
      userId: challenge.userId
    }, 200, corsHeaders);
  }

  return res.send('Not found.', 404, corsHeaders);
};
