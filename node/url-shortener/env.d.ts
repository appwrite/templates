declare global {
  namespace NodeJS {
    interface ProcessEnv {
      APPWRITE_ENDPOINT?: string;
      APPWRITE_FUNCTION_PROJECT_ID: string;
      APPWRITE_API_KEY: string;
      APPWRITE_DATABASE_ID: string;
      APPWRITE_COLLECTION_ID: string;
      SHORT_BASE_URL: string;
    }
  }
}

export {};
