declare global {
  namespace NodeJS {
    interface ProcessEnv {
      APPWRITE_ENDPOINT?: string;
      APPWRITE_API_KEY: string;
      APPWRITE_FUNCTION_PROJECT_ID: string;
      APPWRITE_DATABASE_ID: string;
      APPWRITE_COLLECTION_ID: string;
      PINECONE_API_KEY: string;
      PINECONE_INDEX_ID: string;
      OPENAI_API_KEY: string;
    }
  }
}

export {};
