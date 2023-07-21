namespace runtime {
class Handler {
public:
  // This is your Appwrite function
  // It's executed each time we get a request
  static RuntimeOutput main(RuntimeContext &context) {
    // You can log messages to the console
    context.log("Hello, Logs! 👋");

    // If something goes wrong, log an error
    context.log("Hello, Errors! ⛔");

    // The `req` object contains the request data
    if (context.req.method == "GET") {
      // Send a response with the res object helpers
      // `context.res.send()` dispatches a string back to the client
      return context.res.send("Hello, World! 🌎");
    }

    // `context.res.json()` is a handy helper for sending JSON
    Json::Value response;
    response['motto'] = "Build Fast. Scale Big. All in One Place.";
    response['learn'] = "https://appwrite.io/docs";
    response['connect'] = "https://appwrite.io/discord";
    response['getInspired'] = "https://builtwith.appwrite.io";

    return context.res.json(response);
  }
};
} // namespace runtime