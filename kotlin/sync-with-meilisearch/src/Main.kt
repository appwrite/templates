package io.openruntimes.kotlin.src

import io.openruntimes.kotlin.RuntimeOutput
import io.openruntimes.kotlin.RuntimeContext
import io.openruntimes.kotlin.src.Utils
import io.appwrite.Client as AppwriteClient
import io.appwrite.Query
import io.appwrite.services.Databases
import com.meilisearch.sdk.*
import com.google.gson.Gson
import java.util.HashMap

class Main {

    suspend fun main(context: RuntimeContext): RuntimeOutput {

        Utils.throwIfMissing(System.getenv(), listOf(
            "APPWRITE_API_KEY",
            "APPWRITE_DATABASE_ID",
            "APPWRITE_COLLECTION_ID",
            "MEILISEARCH_ENDPOINT",
            "MEILISEARCH_INDEX_NAME",
            "MEILISEARCH_ADMIN_API_KEY",
            "MEILISEARCH_SEARCH_API_KEY",
        ))

        if (context.req.method == "GET") {
            val html = Utils.interpolate(Utils.getStaticfile(), mapOf(
                "MEILISEARCH_ENDPOINT" to System.getenv("MEILISEARCH_ENDPOINT"),
                "MEILISEARCH_INDEX_NAME" to System.getenv("MEILISEARCH_INDEX_NAME"),
                "MEILISEARCH_SEARCH_API_KEY" to System.getenv("MEILISEARCH_SEARCH_API_KEY"),
            ))

            return context.res.text(html, 200, mapOf("content-type" to "text/html"))
        }

        val client = AppwriteClient().apply {
            setEndpoint(System.getenv("APPWRITE_ENDPOINT") ?: "https://cloud.appwrite.io/v1")
            setProject(System.getenv("APPWRITE_FUNCTION_PROJECT_ID"))
            setKey(System.getenv("APPWRITE_API_KEY"))
        }

        val databases = Databases(client)

        val meilisearch = Client(Config(System.getenv("MEILISEARCH_ENDPOINT"), System.getenv("MEILISEARCH_ADMIN_API_KEY")))

        val index = meilisearch.index(System.getenv("MEILISEARCH_INDEX_NAME"))

        val gson = Gson()

        var cursor: String? = null

        do {
            val queries = mutableListOf<String>()
            queries.add(Query.limit(100))

            if (cursor != null) {
                queries.add(Query.cursorAfter(cursor))
            }

            val documents = databases.listDocuments(
                System.getenv("APPWRITE_DATABASE_ID"),
                System.getenv("APPWRITE_COLLECTION_ID"),
                queries
            ).documents

            if (documents.isNotEmpty()) {
                cursor = documents[documents.size - 1].id
            } else {
                context.log("No more documents found.")
                cursor = null
                break
            }

            context.log("Syncing chunk of ${documents.size} documents ...")
            index.addDocuments(gson.toJson(documents), "\$id")
        } while (cursor != null)

        context.log("Sync finished.");

        return context.res.text("Sync finished.");
    }
}