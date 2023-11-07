import jwt from "jsonwebtoken";
import { fetch } from "undici";
import { getStaticFiles } from "./utils";

export default async ({ req, res, log, error }) => {
  if (req.method === "GET") {
    return res.send(getStaticFiles, 200, {
      "Content-Type": "text/html; charset=utf-8",
    });
  }

  const hasher = new Bun.CryptoHasher("sha256");
  const hashedBuffer = hasher.update(JSON.stringify(req.body)).digest("hex");
  const hashedValue = hashedBuffer.toString();

  const authHeader = req.headers.authorization.split(" ")[1];
  const decodedToken = jwt.verify(authHeader, Bun.env.VONAGE_SIGNATURE_SECRET, {
    algorithms: ["HS256"],
  });

  if (hashedValue != decodedToken["payload_hash"]) {
    return res.json(
      {
        ok: false,
        error: "Payload hash mismatched",
      },
      401
    );
  }

  const secret = `${Bun.env.VONAGE_API_KEY}:${Bun.env.VONAGE_ACCOUNT_SECRET}`;
  const basicAuthToken = btoa(secret);

  if (req.body.text == null) {
    return res.json(
      {
        ok: true,
        status: req.body.status,
      },
      200
    );
  }

  await fetch(`https://messages-sandbox.nexmo.com/v1/messages`, {
    method: "POST",
    body: JSON.stringify({
      from: Bun.env.VONAGE_WHATSAPP_NUMBER,
      to: req.body.from,
      message_type: "text",
      text: `You sent me: ${req.body.text}`,
      channel: "whatsapp",
    }),
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${basicAuthToken}`,
    },
  });

  return res.json(
    {
      ok: true,
    },
    200
  );
};
