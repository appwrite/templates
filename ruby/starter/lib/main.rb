require "appwrite"

# This Appwrite function will be executed every time your function is triggered
def main(context)
  # You can use the Appwrite SDK to interact with other services
  # For this example, we're using the Users service
  client = Appwrite::Client.new
  client
    .set_endpoint(ENV['APPWRITE_FUNCTION_API_ENDPOINT'])
    .set_project(ENV['APPWRITE_FUNCTION_PROJECT_ID'])
    .set_key(context.req.headers["x-appwrite-key"])
  users = Appwrite::Users.new(client)

  begin
    response = users.list()
    # Log messages and errors to the Appwrite Console
    # These logs won't be seen by your end users
    context.log("Total users: " + response.total.to_s)
  rescue Exception => e
    context.error("Could not list users: " + e.full_message)
  end

  # The req object contains the request data
  if (context.req.path == "/ping")
    # Use res object to respond with text(), json(), or binary()
    # Don't forget to return a response!
    return context.res.text("Pong")
  end

  return context.res.json(
    {
      "motto": "Build like a team of hundreds_",
      "learn": "https://appwrite.io/docs",
      "connect": "https://appwrite.io/discord",
      "getInspired": "https://builtwith.appwrite.io",
    }
  )
end
