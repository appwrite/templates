package handler

import (
	"github.com/open-runtimes/types-for-go/v4"
)

// This is your Appwrite function
// It's executed each time we get a request
func Main(Context *types.Context) types.ResponseOutput {
	// Why not try the Appwrite SDK?
	//
	// appwriteClient := client.NewClient()
	// appwriteClient.SetEndpoint(os.Getenv("APPWRITE_FUNCTION_API_ENDPOINT"))
	// appwriteClient.SetProject(os.Getenv("APPWRITE_FUNCTION_PROJECT_ID"))
	// appwriteClient.SetKey(Context.Req.Headers["x-appwrite-key"])

	// You can log messages to the console
	Context.Log("Hello, Logs!")

	// If something goes wrong, log an error
	Context.Error("Hello, Errors!")

	// The `Req` object contains the request data
	if Context.Req.Method == "GET" {
		// Send a text response with the res object helpers
		// `Res.Text()` dispatches a string back to the client
		return Context.Res.Text("Hello, World!", 200, nil)
	}

	// `Res.Json()` is a handy helper for sending JSON
	return Context.Res.Json(map[string]interface{}{
		"motto":       "Build like a team of hundreds_",
		"learn":       "https://appwrite.io/docs",
		"connect":     "https://appwrite.io/discord",
		"getInspired": "https://builtwith.appwrite.io",
	}, 200, nil)
}
