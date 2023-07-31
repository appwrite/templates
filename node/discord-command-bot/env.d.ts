declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DISCORD_PUBLIC_KEY: string;
    }
  }
}

export {};
