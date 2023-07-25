import java.util.HashMap;
import io.appwrite.Client;

public class Main {

    // This is your Appwrite function
    // It's executed each time we get a request
    public RuntimeOutput main(RuntimeContext context) throws Exception {
        // Why not try the Appwrite SDK?
        //
        // Client client = new Client();
        // client
        //         .setEndpoint("https://cloud.appwrite.io/v1")
        //         .setProject(System.getenv("APPWRITE_PROJECT_ID"))
        //         .setKey(System.getenv("APPWRITE_API_KEY"));

        // You can log messages to the console
        context.log("Hello, Logs! 👋");

        // If something goes wrong, log an error
        context.error("Hello, Errors! ⛔");

        // The `context.getReq()` object contains the request data
        if (context.getReq().getMethod().equals("GET")) {
            // Send a response with the res object helpers
            // `context.getRes().send()` dispatches a string back to the client
            return context.getRes().send("Hello, World! 🌎");
        }

        // `context.getRes().json()` is a handy helper for sending JSON
        return context.getRes().json(new HashMap<String, String>() {
            {
                put("motto", "Build Fast. Scale Big. All in One Place.");
                put("learn", "https://appwrite.io/docs");
                put("connect", "https://appwrite.io/discord");
                put("getInspired", "https://builtwith.appwrite.io");
            }
        });
    }
}