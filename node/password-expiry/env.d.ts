declare global {
  namespace NodeJS {
    interface ProcessEnv {
      APPWRITE_FUNCTION_API_ENDPOINT: string;
      APPWRITE_FUNCTION_PROJECT_ID: string;
      STMP_DSN?: string;
      RESET_PASSWORD_URL?: string;
      MAX_PASSWORD_AGE?: string;
    }
  }
}

export {};
