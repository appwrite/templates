# URL Shortener in Python

A Python function to create and manage short URLs.

## 📝 Environment Variables

- `APPWRITE_ENDPOINT`: Your Appwrite endpoint.
- `APPWRITE_API_KEY`: Your Appwrite API key.
- `APPWRITE_PROJECT`: Your Appwrite project ID.
- `DATABASE_ID`: The ID of the database to store URLs.
- `COLLECTION_ID`: The ID of the collection to store URLs.

## 🚀 Building and Deployment

1.  **Create an Appwrite Database and Collection:**
    * Create a database with a unique ID.
    * Create a collection with the following attribute:
        * `original_url` (string, required)

2.  **Deploy the Function:**
    * Package the function: `tar -czvf code.tar.gz .`
    * Upload and deploy the packaged function to your Appwrite project.

## 🛠️ Usage

### Create a Short URL

Execute the function with the following JSON data to create a short URL:

```json
{
  "url": "https://www.google.com"
}