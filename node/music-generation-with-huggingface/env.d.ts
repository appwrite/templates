declare global {
  namespace NodeJS {
    interface ProcessEnv {
      HUGGINGFACE_ACCESS_TOKEN: string;
      APPWRITE_ENDPOINT: string;
      APPWRITE_FUNCTION_PROJECT_ID: string;
      APPWRITE_API_KEY: string;
      APPWRITE_BUCKET_ID: string;
    }
  }
}

export {};
