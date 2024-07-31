import { Client, Users } from "node-appwrite";

// This is your Appwrite Function that runs for every execution
export default async ({ req, res, log, error }: any) => {
  // You can use Appwrite SDK to talk to other services
  const client = new Client()
    .setEndpoint(Bun.env["APPWRITE_FUNCTION_API_ENDPOINT"])
    .setProject(Bun.env["APPWRITE_FUNCTION_PROJECT_ID"])
    .setKey(req.headers['x-appwrite-key'] ?? '');
  const users = new Users(client);

  try {
    const response = await users.list();
    // You can log messages to the Appwrite Console
    // Client-side never sees those
    log(`Amount of users: ${response.total}`);
  } catch(err) {
    // If something goes wrong, you can log error
    // Errors can be found in Appwrite Console too
    error("Could not list users: " + err.message);
  }

  // The `req` object contains the request data
  if (req.path === "/ping") {
    // Use `res` object to respond with `text()`, `json()`, or `binary()`
    // Make sure to always return response!
    return res.text("Pong");
  }

  return res.json({
    motto: "Build like a team of hundreds_",
    learn: "https://appwrite.io/docs",
    connect: "https://appwrite.io/discord",
    getInspired: "https://builtwith.appwrite.io",
  });
};
