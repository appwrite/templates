declare global {
  namespace NodeJS {
    interface ProcessEnv {
      OPENAI_API_KEY: string;
      OPENAI_MAX_TOKENS?: string;
    }
  }
}

export {};
