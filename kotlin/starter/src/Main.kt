package io.openruntimes.kotlin.src

import io.openruntimes.kotlin.RuntimeContext
import io.openruntimes.kotlin.RuntimeOutput
import io.appwrite.Client
import java.util.HashMap

class Main {
    // This is your Appwrite function
    // It's executed each time we get a request
    fun main(context: RuntimeContext): RuntimeOutput {
        // Why not try the Appwrite SDK?
        // val client = Client().apply {
        //    setEndpoint("https://cloud.appwrite.io/v1")
        //    setProject(System.getenv("APPWRITE_FUNCTION_PROJECT_ID"))
        //    setKey(System.getenv("APPWRITE_API_KEY"))
        // }

        // You can log messages to the console
        context.log("Hello, Logs!")

        // If something goes wrong, log an error
        context.error("Hello, Errors!")

        // The `context.req` object contains the request data
        if (context.req.method == "GET") {
            // Send a response with the res object helpers
            // `context.res.send()` dispatches a string back to the client
            return context.res.send("Hello, World!")
        }

        // `context.res.json()` is a handy helper for sending JSON
        return context.res.json(mutableMapOf(
            "motto" to "Build Fast. Scale Big. All in One Place.",
            "learn" to "https://appwrite.io/docs",
            "connect" to "https://appwrite.io/discord",
            "getInspired" to "https://builtwith.appwrite.io"
        ))
    }
}
