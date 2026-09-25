import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

// Kept between executions so warm starts reuse the connection
let db: ReturnType<typeof drizzle> | undefined;

export function getDb() {
  if (!db) {
    db = drizzle(postgres(process.env.DATABASE_URL, { max: 1 }));
  }
  return db;
}
