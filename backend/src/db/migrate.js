import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import pg from 'pg';

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool);

async function runMigration() {
  try {
    console.log("⏳ Executing migrations via programmatic runner...");
    
    await migrate(db, { migrationsFolder: './src/db/migrations' });
    
    console.log("✅ Migrations applied successfully!");
    process.exit(0);
  } catch (error) {
    console.error("\n❌ DATABASE ERROR ENCOUNTERED:");
    console.error(error); // This will output the hidden error details
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigration();
