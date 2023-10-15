declare module 'faker' {
    const faker: {
      random: {
        number(options?: { min?: number; max?: number }): number;
        uuid(): string;
      };
      commerce: {
        productName(): string;
        price(): string;
      };
      date: {
        past(): Date;
      };
      name: {
        findName(): string;
      };
    };
    export default faker;
  }
declare module 'your-pdf-lib-module' {
    import { PDFDocument } from 'pdf-lib';
  
    export function createPdf(params: {
      id: string;
      date: Date;
      name: string;
      items: { description: string; quantity: number; cost: string }[];
      total: number;
    }): Promise<Uint8Array>;
  }  
declare module 'node:buffer' {
    export class Buffer {
      static from(data: string | Uint8Array, encoding?: string): Buffer;
      toString(encoding?: string): string;
    }
 }
