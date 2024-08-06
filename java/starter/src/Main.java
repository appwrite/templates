package io.openruntimes.java.src;

import java.util.concurrent.CountDownLatch;
import java.util.HashMap;
import java.util.Map;
import java.util.ArrayList;
import java.util.Arrays;
import io.appwrite.Client;
import io.appwrite.services.Users;
import io.appwrite.models.UserList;
import io.appwrite.coroutines.CoroutineCallback;
import io.openruntimes.java.RuntimeContext;
import io.openruntimes.java.RuntimeOutput;

public class Main {
    // This Appwrite function will be executed every time your function is triggered
    public RuntimeOutput main(RuntimeContext context) throws Exception {
        // You can use the Appwrite SDK to interact with other services
        // For this example, we're using the Users service
        Client client = new Client();
        client
            .setEndpoint(System.getenv("APPWRITE_FUNCTION_API_ENDPOINT"))
            .setProject(System.getenv("APPWRITE_FUNCTION_PROJECT_ID"))
            .setKey(context.getReq().getHeaders().getOrDefault("x-appwrite-key", ""));
        Users users = new Users(client);

        CountDownLatch latch = new CountDownLatch(1); 
        users.list(
            new CoroutineCallback<>((response, error) -> {
                if (error != null) {
                    context.error("Could not list users: " + error.getMessage());
                    latch.countDown();
                    return;
                }

                // Log messages and errors to the Appwrite Console
                // These logs won't be seen by your end users
                context.log("Total users: " + String.valueOf(response.getTotal()));
                latch.countDown();
            })
        );
        latch.await();

        // The req object contains the request data
        if (context.getReq().getPath().equals("/ping")) {
            // Use res object to respond with text(), json(), or binary()
            // Don't forget to return a response!
            return context.getRes().text("Pong");
        }

        Map<String, Object> json = new HashMap<>();
        json.put("motto", "Build like a team of hundreds_");
        json.put("learn", "https://appwrite.io/docs");
        json.put("connect", "https://appwrite.io/discord");
        json.put("getInspired", "https://builtwith.appwrite.io");
        return context.getRes().json(json);
    }
}
