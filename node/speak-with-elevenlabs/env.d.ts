declare global {
  namespace NodeJS {
    interface ProcessEnv {
      ELEVENLABS_API_KEY: string;
      APPWRITE_BUCKET_ID: string;
      APPWRITE_FUNCTION_API_ENDPOINT: string;
      APPWRITE_FUNCTION_PROJECT_ID: string;
    }
  }
}

export {};
