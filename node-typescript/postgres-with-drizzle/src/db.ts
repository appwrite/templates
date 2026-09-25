import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

// Kept between executions so warm starts reuse the connection
let db: ReturnType<typeof drizzle> | undefined;

export function getDb() {
  if (!db) {
    // Some transaction-mode poolers don't support prepared statements
    db = drizzle(
      postgres(process.env.DATABASE_URL, { max: 1, prepare: false })
    );
  }
  return db;
}
