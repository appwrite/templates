declare global {
  namespace NodeJS {
    interface ProcessEnv {
      APPWRITE_ENDPOINT: string;
      APPWRITE_FUNCTION_PROJECT_ID: string;
      APPWRITE_API_KEY: string;
      GA4_Measurement_Id: string;
      GA4_API_SECRET: string;
    }
  }
}

export {};

