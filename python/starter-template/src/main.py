from appwrite.client import Client
import os


# This is your Appwrite function
# It's executed each time we get a request
def main(ctx):
    # Why not try the Appwrite SDK?
    #
    # client = (
    #     Client()
    #     .set_endpoint("https://cloud.appwrite.io/v1")
    #     .set_project(os.environ["APPWRITE_PROJECT_ID"])
    #     .set_key(os.environ["APPWRITE_API_KEY"])
    # )

    # You can log messages to the console
    ctx.log("Hello, Logs! 👋")

    # If something goes wrong, log an error
    ctx.error("Hello, Errors! ⛔")

    # The `ctx.req` object contains the request data
    if ctx.req.method == "GET":
        # Send a response with the res object helpers
        # `ctx.res.send()` dispatches a string back to the client
        return ctx.res.send("Hello, World! 🌎")

    # `ctx.res.json()` is a handy helper for sending JSON
    return ctx.res.json(
        {
            "motto": "Build Fast. Scale Big. All in One Place.",
            "learn": "https:#appwrite.io/docs",
            "connect": "https:#appwrite.io/discord",
            "getInspired": "https:#builtwith.appwrite.io",
        }
    )
