import { getStaticFile, throwIfMissing } from "./utils.js";
import {
  Client,
  Storage,
  ID,
  InputFile,
  Permission,
  Role,
} from "node-appwrite";
import { ElevenLabsClient } from "elevenlabs";
import consumers from "stream/consumers";

export default async ({ req, res }) => {
  throwIfMissing(process.env, [
    "ELEVENLABS_API_KEY",
    "APPWRITE_API_KEY",
    "APPWRITE_BUCKET_ID",
  ]);

  if (req.method === "GET") {
    return res.text(getStaticFile("index.html"), 200, {
      "Content-Type": "text/html; charset=utf-8",
    });
  }

  if (!req.bodyJson.text || typeof req.bodyJson.text !== "string") {
    return res.json({ ok: false, error: "Missing required field `text`" }, 400);
  }

  const elevenlabs = new ElevenLabsClient();

  const speechAudio = await elevenlabs.voiceGeneration.generate({
    accent: req.bodyJson.accent ?? "british",
    accent_strength: 1.0,
    age: req.bodyJson.age ?? "young",
    gender: req.bodyJson.gender ?? "female",
    text: req.bodyJson.text,
  });
  const blob = await consumers.blob(speechAudio);

  const client = new Client()
    .setEndpoint(
      process.env.APPWRITE_ENDPOINT ?? "https://cloud.appwrite.io/v1",
    )
    .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

  const storage = new Storage(client);
  const file = await storage.createFile(
    process.env.APPWRITE_BUCKET_ID,
    ID.unique(),
    InputFile.fromBlob(blob, "audio.mp3"),
    [Permission.read(Role.any())],
  );

  return res.json(
    {
      ok: true,
      response: `${endpoint}/storage/buckets/${process.env.APPWRITE_BUCKET_ID}/files/${file["$id"]}/view?project=${process.env.APPWRITE_FUNCTION_PROJECT_ID}`,
    },
    200,
  );
};
