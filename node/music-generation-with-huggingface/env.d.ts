declare global {
  namespace NodeJS {
    interface ProcessEnv {
      HUGGINGFACE_ACCESS_TOKEN: string;
      APPWRITE_FUNCTION_API_ENDPOINT: string;
      APPWRITE_FUNCTION_PROJECT_ID: string;
      APPWRITE_BUCKET_ID: string;
    }
  }
}

export {};
