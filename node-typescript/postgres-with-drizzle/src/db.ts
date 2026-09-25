import { fileURLToPath } from 'node:url';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';

const migrationsFolder = fileURLToPath(new URL('../drizzle', import.meta.url));

// Kept between executions so warm starts reuse the connection
let db: ReturnType<typeof drizzle> | undefined;
let migrated: Promise<void> | undefined;

export async function getDb() {
  if (!db) {
    const client = postgres(process.env.DATABASE_URL, {
      max: 1,
      // Keep Postgres notices out of the function logs
      onnotice: () => {},
    });
    db = drizzle(client);
  }

  // Apply pending migrations once per cold start, and retry if they fail
  if (!migrated) {
    migrated = migrate(db, { migrationsFolder }).catch((err) => {
      migrated = undefined;
      throw err;
    });
  }

  await migrated;
  return db;
}
