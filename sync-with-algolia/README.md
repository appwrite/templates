# Appwrite - Algolia Sync Function

This function helps in syncing the data between Appwrite's database and Algolia's search index. It fetches the documents from Appwrite database and updates the Algolia search index.

## Environment Variables

To ensure the function operates as intended, ensure the following variables are set:

- **ALGOLIA_APP_ID**: This is your Algolia application's ID.
- **ALGOLIA_ADMIN_API_KEY**: This is your Algolia application's Admin API key.
- **ALGOLIA_INDEX_ID**: This is the ID of the Algolia index where the data is stored.
- **ALGOLIA_SEARCH_API_KEY**: This is the Search API key of your Algolia application.
- **APPWRITE_API_KEY**: This is your Appwrite project's API key.
- **APPWRITE_DATABASE_ID**: This is the ID of your Appwrite database where the data is stored.
- **APPWRITE_COLLECTION_ID**: This is the ID of the collection within the Appwrite database.
- **APPWRITE_ENDPOINT**: This is the endpoint where your Appwrite server is located.
- **APPWRITE_PROJECT_ID**: This refers to the specific ID of your Appwrite project.

## Usage

This function supports two types of requests:

1. **Retrieving the Search Interface**

   - **Request Type:** GET
   - **Response:** 
     - On success, the function will respond with an HTML interface for Algolia search. The response content type is `text/html`.

2. **Syncing Appwrite Database with Algolia Index**

   - **Request Type:** POST
   - **Response:** 
     - On success, the function will synchronize the Appwrite database with the specified Algolia index and return an empty response. The sync process operates in chunks, retrieving up to 100 documents per request from the Appwrite database and updating them on the Algolia index.

## Limitations

This function synchronizes the Appwrite database with the Algolia index in one direction only - from Appwrite to Algolia. If any changes are made directly on the Algolia index, they will not be reflected in the Appwrite database. 

Additionally, if any changes are made in the Appwrite database after the sync, they will not be reflected in the Algolia index until the sync function is run again. To achieve real-time sync, consider triggering this function whenever a document is added, updated, or deleted in your Appwrite database.
