declare global {
  namespace NodeJS {
    interface ProcessEnv {
      GITHUB_TOKEN: string;
      GITHUB_WEBHOOK_SECRET: string;
    }
  }
}

export {};
