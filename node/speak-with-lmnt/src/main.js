import { getStaticFile, throwIfMissing } from "./utils.js";
import {
  Client,
  Storage,
  ID,
  InputFile,
  Permission,
  Role,
} from "node-appwrite";
import Speech from "lmnt-node";

export default async ({ req, res }) => {
  throwIfMissing(process.env, [
    "LMNT_API_KEY",
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

  const lmnt = new Speech(process.env.LMNT_API_KEY);

  const speechAudio = await lmnt.synthesize(req.bodyJson.text, "lily", {
    format: "mp3",
  });

  const endpoint = process.env.APPWRITE_FUNCTION_API_ENDPOINT;

  const client = new Client()
    .setEndpoint(endpoint)
    .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
    .setKey(req.headers['x-appwrite-key']);

  const storage = new Storage(client);
  const file = await storage.createFile(
    process.env.APPWRITE_BUCKET_ID,
    ID.unique(),
    InputFile.fromBlob(new Blob([speechAudio.audio]), "audio.mp3"),
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
