declare global {
  namespace NodeJS {
    interface ProcessEnv {
      APPWRITE_FUNCTION_API_ENDPOINT: string;
      APPWRITE_FUNCTION_PROJECT_ID: string;
      APPWRITE_DATABASE_ID: string;
      APPWRITE_COLLECTION_ID: string;
      MEILISEARCH_ENDPOINT: string;
      MEILISEARCH_INDEX_NAME: string;
      MEILISEARCH_ADMIN_API_KEY: string;
      MEILISEARCH_SEARCH_API_KEY: string;
    }
  }
}

export {};
