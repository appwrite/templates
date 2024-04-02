declare global {
  namespace NodeJS {
    interface ProcessEnv {
      HUGGINGFACE_ACCESS_TOKEN: string;
    }
  }
}

export {};
