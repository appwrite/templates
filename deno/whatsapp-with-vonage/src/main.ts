import { crypto } from "https://deno.land/std@0.203.0/crypto/mod.ts";
import { encodeHex } from "https://deno.land/std@0.203.0/encoding/hex.ts";

import { jwtVerify } from "https://deno.land/x/jose@v4.15.2/index.ts";

import { throwIfMissing, getStaticFile } from "./utils.ts";

type Context = {
    req: any;
    res: any;
    log: (msg: any) => void;
    error: (msg: any) => void;
};

export default async ({ req, res, log, error }: Context) => {
    throwIfMissing(Deno.env.toObject(), [
        "VONAGE_API_KEY",
        "VONAGE_ACCOUNT_SECRET",
        "VONAGE_SIGNATURE_SECRET",
        "VONAGE_WHATSAPP_NUMBER",
    ]);

    if (req.method === "GET") {
        return res.send(getStaticFile("index.html"), 200, {
            "Content-Type": "text/html; charset=utf-8",
        });
    }

    const token: string = (req.headers.authorization ?? "").split(" ")[1];
    const secret: Uint8Array = new TextEncoder().encode(
        Deno.env.get("VONAGE_SIGNATURE_SECRET")
    );
    const { payload } = await jwtVerify(token, secret, {
        algorithms: ["HS256"],
    });

    try {
        throwIfMissing(payload, ["payload_hash"]);
    } catch (err) {
        if (err instanceof Error)
            return res.json({ ok: false, error: err.message }, 400);
    }

    const hash = crypto.subtle.digestSync(
        "SHA-256",
        new TextEncoder().encode(req.bodyRaw)
    );

    if (encodeHex(hash) !== payload.payload_hash) {
        return res.json({ ok: false, error: "Payload hash mismatch." }, 401);
    }

    try {
        throwIfMissing(req.body, ["from", "text"]);
    } catch (err) {
        if (err instanceof Error)
            return res.json({ ok: false, error: err.message }, 400);
    }

    const basicAuthToken: string = btoa(
        `${Deno.env.get("VONAGE_API_KEY")}:${Deno.env.get(
            "VONAGE_ACCOUNT_SECRET"
        )}`
    );

    await fetch(`https://messages-sandbox.nexmo.com/v1/messages`, {
        method: "POST",
        body: JSON.stringify({
            from: Deno.env.get("VONAGE_WHATSAPP_NUMBER"),
            to: req.body.from,
            message_type: "text",
            text: `Hi there! You sent me: ${req.body.text}`,
            channel: "whatsapp",
        }),
        headers: {
            "Content-Type": "application/json",
            Authorization: `Basic ${basicAuthToken}`,
        },
    });

    return res.json({ ok: true });
};
