import Appwrite
import AppwriteModels
import Foundation

// This Appwrite function will be executed every time your function is triggered
func main(context: RuntimeContext) async throws -> RuntimeOutput {
    // You can use the Appwrite SDK to interact with other services
    // For this example, we're using the Users service
    let client = Client()
       .setEndpoint(ProcessInfo.processInfo.environment["APPWRITE_FUNCTION_API_ENDPOINT"] ?? "")
       .setProject(ProcessInfo.processInfo.environment["APPWRITE_FUNCTION_PROJECT_ID"] ?? "")
       .setKey(context.req.headers["x-appwrite-key"] ?? "")
    let users = Users(client)

    do {
        let response = try await users.list()
        // Log messages and errors to the Appwrite Console
        // These logs won't be seen by your end users
        context.log("Total users: " + String(response.total))
    } catch {
        context.error("Could not list users: " + String(describing: error))
    }

    // The req object contains the request data
    if context.req.path == "/ping" {
        // Use res object to respond with text(), json(), or binary()
        // Don't forget to return a response!
        return context.res.text("Pong")
    }

    return try context.res.json([
        "motto": "Build like a team of hundreds_",
        "learn": "https://appwrite.io/docs",
        "connect": "https://appwrite.io/discord",
        "getInspired": "https://builtwith.appwrite.io",
    ])
}