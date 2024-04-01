import { getStaticFile, throwIfMissing } from "./utils.js";
import { Client, Storage, ID, InputFile, Permission, Role } from "node-appwrite";
import fetch from "node-fetch";

export default async ({ req, res, error }) => {
  throwIfMissing(process.env, [
    "ELEVENLABS_API_KEY",
    "APPWRITE_API_KEY",
    "APPWRITE_BUCKET_ID",
  ]);

  if (req.method === "GET") {
    return res.send(getStaticFile("index.html"), 200, {
      "Content-Type": "text/html; charset=utf-8",
    });
  }

  const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT ?? "https://cloud.appwrite.io/v1")
    .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

  if (!req.body.text || typeof req.body.text !== "string") {
    return res.json({ ok: false, error: "Missing required field `text`" }, 400);
  }

  const body = {
    accent: req.body.accent || "british",
    accent_strength: 1.0,
    age: req.body.age || "young",
    gender: req.body.gender || "female",
    text: req.body.text,
  };

  const resp = await fetch(
    "https://api.elevenlabs.io/v1/voice-generation/generate-voice",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": process.env.ELEVENLABS_API_KEY,
      },
      body: JSON.stringify(body),
    },
  );

  if (resp.status !== 200) {
    error(await resp.text());
    return res.json({ ok: false, error: "Failed to generate audio" }, 500);
  }

  // Upload audio file to Appwrite Storage
  const storage = new Storage(client);
  let file = await storage.createFile(
    process.env.APPWRITE_BUCKET_ID,
    ID.unique(),
    InputFile.fromBlob(await resp.blob(), "audio.mp3"),
    [Permission.read(Role.any())],
  );

  return res.json({ ok: true, response: `${endpoint}/storage/buckets/${process.env.APPWRITE_BUCKET_ID}/files/${file['$id']}/view?project=${process.env.APPWRITE_FUNCTION_PROJECT_ID}` }, 200);
};
