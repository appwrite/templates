declare global {
  namespace NodeJS {
    interface ProcessEnv {
      MODAL_TOKEN: string;
    }
  }
}

export {};
