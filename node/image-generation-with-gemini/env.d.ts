declare global {
  namespace NodeJS {
    interface ProcessEnv {
      // Google Gemini
      GEMINI_API_KEY: string;
      GEMINI_MODEL?: string;

      // Appwrite
      APPWRITE_FUNCTION_API_ENDPOINT?: string;
      APPWRITE_FUNCTION_PROJECT_ID?: string;
      APPWRITE_FUNCTION_API_KEY?: string;
      APPWRITE_BUCKET_ID?: string;
    
    }
  }
}

export {};
