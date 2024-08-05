#include "../RuntimeResponse.h"
#include "../RuntimeRequest.h"
#include "../RuntimeOutput.h"
#include "../RuntimeContext.h"

namespace runtime {
  class Handler {
    public:
      // This Appwrite function will be executed every time your function is triggered
      static RuntimeOutput main(RuntimeContext &context) {
        // Log messages and errors to the Appwrite Console
        // These logs won't be seen by your end users
        context.log("Hello, Logs!");
        context.error("Hello, Errors!");

        // The req object contains the request data
        if (context.req.path == "/ping") {
          // Use res object to respond with text(), json(), or binary()
          // Don't forget to return a response!
          return context.res.text("Pong");
        }

        Json::Value response;
        response["motto"] = "Build like a team of hundreds_";
        response["learn"] = "https://appwrite.io/docs";
        response["connect"] = "https://appwrite.io/discord";
        response["getInspired"] = "https://builtwith.appwrite.io";
        return context.res.json(response);
      }
  };
}
