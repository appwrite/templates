declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PERSPECTIVE_API_KEY: string;
    }
  }
}

export {};
