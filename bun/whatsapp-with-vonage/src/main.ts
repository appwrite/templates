import jwt from "jsonwebtoken";
import { fetch } from "undici";
import { getStaticFile, throwIfMissing } from "./utils.ts";

type Context = {
  req: any;
  res: any;
  log: (msg: any) => void;
  error: (msg: any) => void;
};

export default async ({ req, res, log, error }: Context) => {
  throwIfMissing(Bun.env, [
    "VONAGE_API_KEY",
    "VONAGE_ACCOUNT_SECRET",
    "VONAGE_WHATSAPP_NUMBER",
    "VONAGE_SIGNATURE_SECRET",
  ]);

  if (req.method === "GET") {
    return res.send(getStaticFile("index.html"), 200, {
      "Content-Type": "text/html; charset=utf-8",
    });
  }

  const token: string = (req.headers.authorization ?? "").split(" ")[1];
  const decodedToken = jwt.verify(token, Bun.env.VONAGE_SIGNATURE_SECRET, {
    algorithms: ["HS256"],
  });

  try {
    throwIfMissing(decodedToken, ["payload_hash"]);
  } catch (err) {
    return res.json({ ok: false, error: err.message }, 400);
  }

  const hasher = new Bun.CryptoHasher("sha256");
  const hashedValue = hasher.update(req.bodyRaw).digest("hex").toString();

  if (hashedValue != decodedToken["payload_hash"]) {
    return res.json({ ok: false, error: "Payload hash mismatched" }, 401);
  }

  try {
    throwIfMissing(req.body, ["from", "to"]);
  } catch (err) {
    return res.json({ ok: false, error: err.message }, 400);
  }

  const basicAuthToken: string = btoa(
    `${Bun.env.VONAGE_API_KEY}:${Bun.env.VONAGE_ACCOUNT_SECRET}`
  );

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

  return res.json({ ok: true }, 200);
};
