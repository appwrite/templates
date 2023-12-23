declare global {
  namespace NodeJS {
    interface ProcessEnv {
      APPWRITE_ENDPOINT?: string;
      APPWRITE_FUNCTION_PROJECT_ID: string;
      APPWRITE_API_KEY?: string;
      STMP_DSN?: string;
      RESET_PASSWORD_URL?: string;
      MAX_PASSWORD_AGE?: string;
    }
  }
}

export {};
