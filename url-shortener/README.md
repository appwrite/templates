# URL Shortener Function

This function allows you to turn long URLs into shortened, more manageable URLs. A unique, short, alphanumeric code is generated for each URL and stored in a database collection. The original URL can be accessed later using the short code.

## Environment Variables

To ensure the function operates as intended, ensure the following variables are set:

- **APPWRITE_API_KEY**: This is your Appwrite project's API key.
- **APPWRITE_ENDPOINT**: This is the endpoint where your Appwrite server is located.
- **APPWRITE_PROJECT_ID**: This refers to the specific ID of your Appwrite project.
- **SHORT_DOMAIN**: This is the base domain used when generating the short URLs.

Additionally, the function has the following optional variables:

- **DATABASE_ID**: This is the ID for the database where URLs will be stored. If not provided, it will default to "url-shortener".
- **COLLECTION_ID**: This is the ID for the collection within the database. If not provided, it defaults to "urls".

## Database Setup

After the installation step, jf the specified database doesn't exist, the setup script will automatically create it. It will also create a collection within the database, adding a URL attribute to the collection.

## Usage

This function supports two types of requests:

1. **Creating a Short URL**

   - **Request Type:** POST
   - **Content Type:** application/json
   - **Body:** 
     - `url`: URL to be shortened
   - **Response:** 
     - On success, the function will respond with the original URL and the shortened URL.
     - Example: `{"original": "https://mylongdomain.com/videos/xHduwbGDq?t=5000&c=32i7333", "short": "https://short.domain/abc123"}`

2. **Redirecting from a Short URL**

   - **Request Type:** GET
   - **Path Parameter:** The short URL code
   - **Response:** 
     - On success, the function will redirect the user to the original URL.
     - If the code does not exist in the database, a 404 error will be returned.

