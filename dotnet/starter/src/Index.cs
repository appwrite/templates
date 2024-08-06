namespace DotNetRuntime;

using Appwrite;
using Appwrite.Services;
using Appwrite.Models;

public class Handler {
    // This Appwrite function will be executed every time your function is triggered
    public async Task<RuntimeOutput> Main(RuntimeContext Context) 
    {
        // You can use the Appwrite SDK to interact with other services
        // For this example, we're using the Users service
        var client = new Client()
            .SetEndpoint(Environment.GetEnvironmentVariable("APPWRITE_FUNCTION_API_ENDPOINT"))
            .SetProject(Environment.GetEnvironmentVariable("APPWRITE_FUNCTION_PROJECT_ID"))
            .SetKey(Context.Req.Headers.TryGetValue("x-appwrite-key", out string DynamicKey) ? DynamicKey : "");
        var users = new Users(client);

        try
        {
            var response = await users.List();
            // Log messages and errors to the Appwrite Console
            // These logs won't be seen by your end users
            Context.Log("Total users: " + response.Total);
        }
        catch (Exception e)
        {
            Context.Error("Could not list users: " + e.ToString());
        }

        // The req object contains the request data
        if (Context.Req.Path == "/ping") {
            // Use res object to respond with text(), json(), or binary()
            // Don't forget to return a response!
            return Context.Res.Text("Pong");
        }

        return Context.Res.Json(new Dictionary<string, object?>()
        {
            { "motto", "Build like a team of hundreds_" },
            { "learn", "https://appwrite.io/docs" },
            { "connect", "https://appwrite.io/discord" },
            { "getInspired", "https://builtwith.appwrite.io" },
        });
    }
}