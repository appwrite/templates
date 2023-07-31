declare global {
  namespace NodeJS {
    interface ProcessEnv {
      APPWRITE_ENDPOINT?: string;
      APPWRITE_PROJECT_ID?: string;
      APPWRITE_FUNCTION_PROJECT_ID: string;
      APPWRITE_API_KEY: string;
      STRIPE_SECRET_KEY: string;
      STRIPE_WEBHOOK_SECRET: string;
      SUCCESS_URL: string;
      CANCEL_URL: string;
    }
  }
}

export {};
