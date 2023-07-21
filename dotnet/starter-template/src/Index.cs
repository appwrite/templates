namespace DotNetRuntime;

using Appwrite;
using Appwrite.Services;
using Appwrite.Models;

public class Handler {

    // This is your Appwrite function
    // It's executed each time we get a request
    public async Task<RuntimeOutput> Main(RuntimeContext Context) 
    {
        // Why not try the Appwrite SDK?
        //
        // var client = new Client()
        //     .SetEndpoint("http://cloud.appwrite.io/v1")  
        //     .SetProject("5ff3379a01d25")                 
        //     .SetKey("cd868db89");   

        // You can log messages to the console
        Context.Log('Hello, Logs! 👋');

        // If something goes wrong, log an error
        Context.Error('Hello, Errors! ⛔');

        // The `Context.Req` object contains the request data
        if (Context.Req.Method === 'GET') {
            // Send a response with the res object helpers
            // `Context.Res.Send()` dispatches a string back to the client
            return Context.Req.Send('Hello, World! 🌎');
        }

        // `Context.Res.Json()` is a handy helper for sending JSON
        return Context.Res.Json(new()
        {
            { 'motto': 'Build Fast. Scale Big. All in One Place.' },
            { 'learn': 'https://appwrite.io/docs' },
            { 'connect': 'https://appwrite.io/discord' },
            { 'getInspired': 'https://builtwith.appwrite.io' },
        });
    }
}