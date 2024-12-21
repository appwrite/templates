declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DISCORD_PUBLIC_KEY: string;
      DISCORD_APPLICATION_ID: string;
      DISCORD_TOKEN: string;
    }
  }
}

export {};
