declare global {
  namespace NodeJS {
    interface ProcessEnv {
      VONAGE_API_KEY: string;
      VONAGE_API_SECRET: string;
      VONAGE_API_SIGNATURE_SECRET: string;
      VONAGE_WHATSAPP_NUMBER: string;
    }
  }
}

export {};
