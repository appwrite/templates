import { Client, Users, Query, ID } from 'node-appwrite';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { request } from 'undici';

interface RequestBody {
  code: string;
  firstName?: string;
  lastName?: string;
}

interface AppleTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  id_token: string;
}

interface AppleIdTokenPayload {
  sub: string;
  email?: string;
  email_verified?: boolean;
  aud: string;
  iss: string;
  iat: number;
  exp: number;
}

// This Appwrite function will be executed every time your function is triggered
export default async ({ req, res, log, error }: any) => {
  try {
    // Validate required environment variables
    const requiredEnvVars = [
      'BUNDLE_ID',
      'TEAM_ID',
      'KEY_ID',
      'KEY_CONTENTS_ENCODED',
    ];
    for (const varName of requiredEnvVars) {
      if (!process.env[varName]) {
        throw new Error(`Environment variable ${varName} must be set.`);
      }
    }

    const bundleId = process.env.BUNDLE_ID!;
    const teamId = process.env.TEAM_ID!;
    const keyId = process.env.KEY_ID!;
    const keyContentsEncoded = process.env.KEY_CONTENTS_ENCODED!;

    // Decode the base64 encoded private key
    const keyContents = Buffer.from(keyContentsEncoded, 'base64').toString(
      'utf8'
    );

    // Parse request body
    const reqBody: RequestBody =
      typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { code, firstName = '', lastName = '' } = reqBody;

    // Validate input
    if (!code) {
      throw new Error('Code must be provided in the request body.');
    }

    // Create JWT client secret for Apple
    const now = Math.floor(Date.now() / 1000);
    const payload = {
      iss: teamId,
      iat: now,
      exp: now + 300, // 5 minutes
      aud: 'https://appleid.apple.com',
      sub: bundleId,
    };

    const header = {
      alg: 'ES256',
      kid: keyId,
    };

    const clientSecret = jwt.sign(payload, keyContents, {
      algorithm: 'ES256',
      header: header,
    });

    // Exchange authorization code for tokens
    const authTokenRequestBody = new URLSearchParams({
      grant_type: 'authorization_code',
      code: code,
      client_id: bundleId,
      client_secret: clientSecret,
    });

    const authTokenResponse = await request(
      'https://appleid.apple.com/auth/token',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: authTokenRequestBody.toString(),
      }
    );

    if (authTokenResponse.statusCode !== 200) {
      const responseBody = await authTokenResponse.body.text();
      throw new Error(`Failed to exchange code for token: ${responseBody}`);
    }

    const tokenData =
      (await authTokenResponse.body.json()) as AppleTokenResponse;

    // Decode the ID token to get user information
    const idTokenDecoded = jwt.decode(
      tokenData.id_token
    ) as AppleIdTokenPayload;

    if (!idTokenDecoded || !idTokenDecoded.sub) {
      throw new Error('ID Token does not contain a valid subject (sub) claim.');
    }

    // Hash the sub because it is too long and has characters that are not allowed in Appwrite user IDs
    const userId = crypto
      .createHash('md5')
      .update(idTokenDecoded.sub)
      .digest('hex');
    const email = idTokenDecoded.email || '';
    const userName = `${firstName} ${lastName}`.trim();

    // Initialize Appwrite client
    const client = new Client()
      .setEndpoint(process.env.APPWRITE_FUNCTION_API_ENDPOINT ?? '')
      .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID ?? '')
      .setKey(req.headers['x-appwrite-key'] ?? '');

    const users = new Users(client);

    // Find user by ID
    let user = null;
    try {
      user = await users.get(userId);
    } catch (err: any) {
      if (err.type !== 'user_not_found') {
        throw err;
      }
    }

    // Find user by email if not found by ID
    if (!user && email) {
      try {
        const userList = await users.list([Query.equal('email', email)]);
        if (userList.users.length > 0) {
          user = userList.users[0];
        }
      } catch (err: any) {
        log('Error searching for user by email:', err.message);
      }
    }

    // If user does not exist, create a new user
    if (!user) {
      user = await users.create(
        ID.custom(userId),
        email,
        undefined, // phone
        undefined, // password
        userName || undefined // name
      );
    }

    // Mark the user as verified if not already verified
    if (!user.emailVerification && email) {
      try {
        await users.updateEmailVerification(userId, true);
      } catch (err: any) {
        log('Error updating email verification:', err.message);
      }
    }

    // Create token
    const token = await users.createToken(user.$id, 60, 128);

    return res.json({
      secret: token.secret,
      userId: user.$id,
      expire: token.expire,
    });
  } catch (err: any) {
    error('Error in sign-in-with-apple function:', err.message);
    return res.json({ error: err.message }, 400);
  }
};
