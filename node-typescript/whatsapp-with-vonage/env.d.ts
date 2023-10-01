import { JsonWebTokenError } from 'jsonwebtoken';

declare global {
    namespace NodeJS {
        interface ProcessEnv {
            VONAGE_API_KEY: string;
            VONAGE_ACCOUNT_SECRET: string;
            VONAGE_SIGNATURE_SECRET: string;
            VONAGE_WHATSAPP_NUMBER: string;
        }
    }
}

declare module 'jsonwebtoken' {
    export interface JwtPayload {
        payload_hash: string;
    }
}

export {};
