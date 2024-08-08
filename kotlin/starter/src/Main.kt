package io.openruntimes.kotlin.src

import io.openruntimes.kotlin.RuntimeContext
import io.openruntimes.kotlin.RuntimeOutput
import io.appwrite.Client
import io.appwrite.services.Users
import java.util.HashMap

class Main {
    // This Appwrite function will be executed every time your function is triggered
    suspend fun main(context: RuntimeContext): RuntimeOutput {
        // You can use the Appwrite SDK to interact with other services
        // For this example, we're using the Users service
        val client = Client().apply {
           setEndpoint(System.getenv("APPWRITE_FUNCTION_API_ENDPOINT"))
           setProject(System.getenv("APPWRITE_FUNCTION_PROJECT_ID"))
           setKey(context.req.headers["x-appwrite-key"] ?: "")
        }
        val users = Users(client)

        try {
            val response = users.list()
            // Log messages and errors to the Appwrite Console
            // These logs won't be seen by your end users
            context.log("Total users: " + response.total.toString())
        } catch (error: Exception) {
            context.error("Could not list users: " + error.message)
        }

        // The req object contains the request data
        if (context.req.path == "/ping") {
            // Use res object to respond with text(), json(), or binary()
            // Don't forget to return a response!
            return context.res.send("Pong")
        }

        return context.res.json(mutableMapOf(
            "motto" to "Build like a team of hundreds_",
            "learn" to "https://appwrite.io/docs",
            "connect" to "https://appwrite.io/discord",
            "getInspired" to "https://builtwith.appwrite.io"
        ))
    }
}
