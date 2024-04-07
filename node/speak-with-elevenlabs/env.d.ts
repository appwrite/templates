declare global {
  namespace NodeJS {
    interface ProcessEnv {
      ELEVENLABS_API_KEY: string;
      APPWRITE_BUCKET_ID: string;
      APPWRITE_API_KEY: string;
      APPWRITE_ENDPOINT: string;
    }
  }
}

export {};
