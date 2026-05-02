use appwrite::client::Client;
use appwrite::services::users::Users;
use openruntimes::{Context, Response};
use serde_json::json;
use std::env;

// This Appwrite function will be executed every time your function is triggered
pub fn main(context: Context) -> Response {
    // You can use the Appwrite SDK to interact with other services
    // For this example, we're using the Users service
    let client = Client::new()
        .set_endpoint(env::var("APPWRITE_FUNCTION_API_ENDPOINT").unwrap_or_default())
        .set_project(env::var("APPWRITE_FUNCTION_PROJECT_ID").unwrap_or_default())
        .set_key(
            context
                .req
                .headers
                .get("x-appwrite-key")
                .cloned()
                .unwrap_or_default(),
        );
    let users = Users::new(&client);

    match tokio::runtime::Runtime::new() {
        Ok(runtime) => match runtime.block_on(users.list(None, None, None)) {
            Ok(response) => {
                // Log messages and errors to the Appwrite Console
                // These logs won't be seen by your end users
                context.log(format!("Total users: {}", response.total));
            }
            Err(error) => {
                context.error(format!("Could not list users: {}", error));
            }
        },
        Err(error) => {
            context.error(format!("Could not create runtime: {}", error));
        }
    }

    // The req object contains the request data
    if context.req.path == "/ping" {
        // Use res object to respond with text(), json(), or binary()
        // Don't forget to return a response!
        return context.res.text("Pong", None, None);
    }

    context.res.json(
        json!({
            "motto": "Build like a team of hundreds_",
            "learn": "https://appwrite.io/docs",
            "connect": "https://appwrite.io/discord",
            "getInspired": "https://builtwith.appwrite.io",
        }),
        None,
        None,
    )
}
