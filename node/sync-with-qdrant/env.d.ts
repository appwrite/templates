declare global {
  namespace NodeJS {
    interface ProcessEnv {
      APPWRITE_ENDPOINT?: string;
      APPWRITE_API_KEY: string;
      APPWRITE_FUNCTION_PROJECT_ID: string;
      APPWRITE_DATABASE_ID: string;
      APPWRITE_COLLECTION_ID: string;
      QDRANT_API_KEY: string;
      QDRANT_COLLECTION_NAME: string;
      QDRANT_URL: string;
      OPENAI_API_KEY: string;
    }
  }
}

export {};
