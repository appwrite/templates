import {
  Client,
  Databases,
  Query,
} from "https://deno.land/x/appwrite@9.0.0/mod.ts";
import { getStaticFile, interpolate, throwIfMissing } from "./utils.ts";
import { MeiliSearch } from "https://esm.sh/meilisearch@0.35.0";

export default async ({ req, res, log, error }: any) => {
  throwIfMissing(Deno.env.toObject(), [
    "APPWRITE_API_KEY",
    "APPWRITE_DATABASE_ID",
    "APPWRITE_COLLECTION_ID",
    "MEILISEARCH_ENDPOINT",
    "MEILISEARCH_INDEX_NAME",
    "MEILISEARCH_ADMIN_API_KEY",
    "MEILISEARCH_SEARCH_API_KEY",
  ]);

  if (req.method === "GET") {
    const html = interpolate(await getStaticFile("index.html"), {
      MEILISEARCH_ENDPOINT: Deno.env.get("MEILISEARCH_ENDPOINT"),
      MEILISEARCH_INDEX_NAME: Deno.env.get("MEILISEARCH_INDEX_NAME"),
      MEILISEARCH_SEARCH_API_KEY: Deno.env.get("MEILISEARCH_SEARCH_API_KEY"),
    });

    return new res.send(html, 200, {
      "Content-Type": "text/html; charset=utf-8",
    });
  }

  const client = new Client()
    .setEndpoint(
      Deno.env.get("APPWRITE_ENDPOINT") ?? "https://cloud.appwrite.io/v1",
    )
    .setProject(Deno.env.get("APPWRITE_FUNCTION_PROJECT_ID") ?? "")
    .setKey(Deno.env.get("APPWRITE_API_KEY") ?? "");

  const databases = new Databases(client);

  const meilisearch = new MeiliSearch({
    host: Deno.env.get("MEILISEARCH_ENDPOINT") ?? "",
    apiKey: Deno.env.get("MEILISEARCH_ADMIN_API_KEY") ?? "",
  });

  const index = meilisearch.index(Deno.env.get("MEILISEARCH_INDEX_NAME") ?? "");

  let cursor = null;

  do {
    const queries = [Query.limit(100)];

    if (cursor) {
      queries.push(Query.cursorAfter(cursor));
    }

    const { documents } = await databases.listDocuments(
      Deno.env.get("APPWRITE_DATABASE_ID") ?? "",
      Deno.env.get("APPWRITE_COLLECTION_ID") ?? "",
      queries,
    );

    if (documents.length > 0) {
      cursor = documents[documents.length - 1].$id;
    } else {
      log(`No more documents found.`);
      cursor = null;
      break;
    }

    log(`Syncing chunk of ${documents.length} documents ...`);
    await index.addDocuments(documents, { primaryKey: "$id" });
  } while (cursor !== null);

  log("Sync finished.");

  return res.send("Sync finished.", 200);
};
