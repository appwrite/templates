declare global {
  namespace NodeJS {
    interface ProcessEnv {
      KEPLARS_API_KEY: string;
    }
  }
}

export {};
