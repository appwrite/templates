declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PANGEA_REDACT_TOKEN: string;
    }
  }
}

export {};
