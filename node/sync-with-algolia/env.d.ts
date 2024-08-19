declare global {
  namespace NodeJS {
    interface ProcessEnv {
      ALGOLIA_APP_ID: string;
      ALGOLIA_ADMIN_API_KEY: string;
      ALGOLIA_SEARCH_API_KEY: string;
      ALGOLIA_INDEX_ID: string;
      APPWRITE_FUNCTION_API_ENDPOINT: string;
      APPWRITE_FUNCTION_PROJECT_ID: string;
      APPWRITE_DATABASE_ID: string;
      APPWRITE_COLLECTION_ID: string;
    }
  }
}

export {};
