import jwt from "jsonwebtoken";
import { fetch } from "undici";

export default async ({ req, res, log, error }) => {
  if (req.method === "GET") {
    const fileName = Bun.resolveSync("../static/index.html", import.meta.dir);
    const html = await Bun.file(fileName).text();

    return res.send(html, 200, {
      "Content-Type": "text/html; charset=utf-8",
    });
  }

  const hasher = new Bun.CryptoHasher("sha256");
  const buffer = hasher.update(JSON.stringify(req.body)).digest();
  const hashed_value = buffer.toString("hex");

  try {
    const authHeader = req.headers.authorization.split(" ")[1];
    const decodedToken = jwt.verify(authHeader, Bun.env.SIGNATURE_SECRET, {
      algorithms: ["HS256"],
    });
    if (hashed_value != decodedToken["payload_hash"]) {
      return res.json({
        ok: false,
        error: "Payload mismatched",
      });
    }
  } catch (err) {
    return res.json({
      ok: false,
      error: "can't verify",
    });
  }

  const secret = `${Bun.env.VONAGE_API_KEY}:${Bun.env.VONAGE_ACCOUNT_SECRET}`;
  const basicAuthToken = btoa(secret);
  if (!(req.body.text == null)) {
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
  }

  return res.json(
    {
      ok: true,
      status: req.body.status,
    },
    200
  );
};
