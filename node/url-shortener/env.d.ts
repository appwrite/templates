declare global {
  namespace NodeJS {
    interface ProcessEnv {
      APPWRITE_ENDPOINT?: string;
      APPWRITE_PROJECT_ID?: string;
      APPWRITE_API_KEY?: string;
      SHORT_DOMAIN?: string;
    }
  }
}

export {};
