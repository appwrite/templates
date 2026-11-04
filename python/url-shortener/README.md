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
        * `original_url` (string, required, size 2048)

2.  **Deploy the Function:**
    * Package the function: `tar -czvf code.tar.gz .`
    * In the Appwrite Console, go to **Functions** and click **Create Function**.
    * Select the **Python 3.9** runtime.
    * Upload the `code.tar.gz` file.
    * In the **Settings** tab, set the **Entrypoint** to `src/main.py`.
    * Add the required environment variables.
    * Activate the function.

## 🛠️ Usage

### Create a Short URL

Execute the function with a `POST` request and a JSON body:

```json
{
  "url": "[https://www.google.com](https://www.google.com)"
}
```