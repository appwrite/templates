import { getStaticFile, throwIfMissing } from "./utils.js";
import { Client, Storage, ID, Permission, Role, InputFile } from "node-appwrite";
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import consumers from "stream/consumers";

const APPWRITE_ENDPOINT =
  process.env.APPWRITE_ENDPOINT ?? "https://cloud.appwrite.io/v1";

export default async ({ req, res }) => {
  throwIfMissing(process.env, [
    "ELEVENLABS_API_KEY",
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

  const voiceId =
    process.env.ELEVENLABS_VOICE_ID ?? "JBFqnCBsd6RMkjVDRZzb";

  const elevenlabs = new ElevenLabsClient({
    apiKey: process.env.ELEVENLABS_API_KEY,
  });

  const speechAudio = await elevenlabs.textToSpeech.convert(voiceId, {
    text: req.bodyJson.text,
    modelId: "eleven_multilingual_v2",
    outputFormat: "mp3_44100_128",
  });

  const buffer = Buffer.from(await consumers.arrayBuffer(speechAudio));

  const client = new Client()
    .setEndpoint(process.env.APPWRITE_FUNCTION_API_ENDPOINT)
    .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
    .setKey(req.headers["x-appwrite-key"]);

  const storage = new Storage(client);
  const file = await storage.createFile(
    process.env.APPWRITE_BUCKET_ID,
    ID.unique(),
    InputFile.fromBuffer(buffer, "speech.mp3"),
    [Permission.read(Role.any())]
  );

  const imageUrl = new URL(
    `/storage/buckets/${process.env.APPWRITE_BUCKET_ID}/files/${file["$id"]}/view`,
    APPWRITE_ENDPOINT
  );

  imageUrl.searchParams.set(
    "project",
    process.env.APPWRITE_FUNCTION_PROJECT_ID
  );

  return res.json(
    {
      ok: true,
      imageUrl: imageUrl.toString(),
    },
    200
  );
};
