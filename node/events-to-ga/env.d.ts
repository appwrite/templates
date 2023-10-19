declare global {
  namespace NodeJS {
    interface ProcessEnv {
      GA4_MEASUREMENT_ID: string;
      GA4_API_SECRET: string;
    }
  }
}

export {};
