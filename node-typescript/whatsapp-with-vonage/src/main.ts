import jwt, { JwtPayload } from 'jsonwebtoken';
import sha256 from 'sha256';
import { fetch } from 'undici';

import { getStaticFile, throwIfMissing } from './utils.js';

type Context = {
    req: any;
    res: any;
    log: (msg: any) => void;
    error: (msg: any) => void;
};

export default async ({ req, res, log, error }: Context) => {
    throwIfMissing(process.env, [
        'VONAGE_API_KEY',
        'VONAGE_ACCOUNT_SECRET',
        'VONAGE_SIGNATURE_SECRET',
        'VONAGE_WHATSAPP_NUMBER',
    ]);

    if (req.method === 'GET') {
        return res.send(getStaticFile('index.html'), 200, {
            'Content-Type': 'text/html; charset=utf-8',
        });
    }

    /*
     * Extract and verify the JWT token in the authorization header which is signed with your Vonage signature secret
     * (verifies the authenticity of the request)
     */
    const token: string = (req.headers.authorization ?? '').split(' ')[1];
    const decoded: string | JwtPayload = jwt.verify(
        token,
        process.env.VONAGE_SIGNATURE_SECRET,
        {
            algorithms: ['HS256'],
        }
    );

    /*
     * Compare SHA-256 hash of the request payload to the payload_hash field found in the JWT claims
     * (verifies the request payload has not been tampered with)
     */
    try {
        throwIfMissing(decoded, ['payload_hash']);
    } catch (err) {
        if (err instanceof Error)
            return res.json({ ok: false, error: err.message }, 400);
    }

    if (sha256(req.bodyRaw) !== (decoded as JwtPayload).payload_hash) {
        return res.json({ ok: false, error: 'Payload hash mismatch.' }, 401);
    }

    // Send a response message through Whatsapp
    try {
        throwIfMissing(req.body, ['from', 'text']);
    } catch (err) {
        if (err instanceof Error)
            return res.json({ ok: false, error: err.message }, 400);
    }

    const basicAuthToken: string = btoa(
        `${process.env.VONAGE_API_KEY}:${process.env.VONAGE_ACCOUNT_SECRET}`
    );

    await fetch(`https://messages-sandbox.nexmo.com/v1/messages`, {
        method: 'POST',
        body: JSON.stringify({
            from: process.env.VONAGE_WHATSAPP_NUMBER,
            to: req.body.from,
            message_type: 'text',
            text: `Hi there! You sent me: ${req.body.text}`,
            channel: 'whatsapp',
        }),
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Basic ${basicAuthToken}`,
        },
    });

    return res.json({ ok: true });
};
