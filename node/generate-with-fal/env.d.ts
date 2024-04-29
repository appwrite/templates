declare global {
  namespace NodeJS {
    interface ProcessEnv {
      FAL_API_KEY: string;
    }
  }
}

export {};
