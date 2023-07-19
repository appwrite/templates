declare global {
  namespace NodeJS {
    interface ProcessEnv {
      MEILISEARCH_ENDPOINT?: string;
      MEILISEARCH_ADMIN_API_KEY?: string;
      MEILISEARCH_INDEX_NAME?: string;
      MEILISEARCH_SEARCH_API_KEY?: string;
      APPWRITE_ENDPOINT?: string;
      APPWRITE_PROJECT_ID?: string;
      APPWRITE_API_KEY?: string;
      APPWRITE_FUNCTION_PROJECT_ID?: string;
      APPWRITE_DATABASE_ID?: string;
      APPWRITE_COLLECTION_ID?: string;
    }
  }
}

export {};
