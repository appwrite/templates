# Meilisearch Sync Function

This function enables synchronization of data between your Appwrite project and a Meilisearch instance. When invoked, it retrieves documents from a specified collection in your Appwrite database and syncs them with a designated Meilisearch index. This function is designed for facilitating full-text search and other search functionalities over data stored in Appwrite using Meilisearch. 

## Environment Variables

The function requires the following environment variables to be set:

- **MEILISEARCH_ENDPOINT**: The URL where your Meilisearch server is located.
- **MEILISEARCH_ADMIN_API_KEY**: The admin API key of your Meilisearch instance.
- **MEILISEARCH_INDEX_NAME**: The name of the Meilisearch index where the documents will be stored.
- **MEILISEARCH_SEARCH_API_KEY**: The search API key of your Meilisearch instance.
- **APPWRITE_API_KEY**: Your Appwrite project's API key.
- **APPWRITE_DATABASE_ID**: The ID of the Appwrite database from which documents will be fetched.
- **APPWRITE_COLLECTION_ID**: The ID of the collection within the database from which documents will be fetched.
- **APPWRITE_ENDPOINT**: The URL of your Appwrite server.
- **APPWRITE_PROJECT_ID**: The ID of your Appwrite project.

## Usage

This function supports two types of requests:

1. **View Search Interface**

   - **Request Type:** GET
   - **Response:** 
     - The function will respond with an HTML page for interacting with Meilisearch. The HTML file (`index.html`) should be placed in the `static` folder.

2. **Sync Appwrite Documents with Meilisearch**

   - **Request Type:** POST
   - **Response:** 
     - The function will begin fetching documents from the specified Appwrite collection and syncing them with the specified Meilisearch index. If successful, an empty response is returned. The function logs the progress of the operation, which can be monitored via the Appwrite dashboard.

## Limitations

This function syncs a maximum of 100 documents at a time. If the collection has more than 100 documents, the function will keep fetching and syncing in chunks until all documents have been processed.

## Caution

Be careful when syncing large collections. This function does not implement rate limiting, which could lead to your Appwrite or Meilisearch instance getting overwhelmed by a large number of requests in a short period. Consider adding delay or rate limiting logic if you plan to sync large amounts of data.