declare module "bun" {
  interface Env {
    APPWRITE_FUNCTION_API_ENDPOINT: string;
    APPWRITE_FUNCTION_PROJECT_ID: string;
  }
}

export {};
