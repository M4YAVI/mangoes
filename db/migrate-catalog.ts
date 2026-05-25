// One-off migration: introduce the varieties table and convert order_items.variety
// from the mango_variety enum to varchar(80) so the catalog can be admin-managed.
// Idempotent — safe to re-run.

import 'dotenv/config';
import { neon } from '@neondatabase/serverless';

const url = process.env.DATABASE_URL;
if (!url) throw new Error('DATABASE_URL missing');
const sql = neon(url);

async function exec(label: string, q: string) {
  process.stdout.write(`→ ${label} … `);
  try {
    await sql.query(q);
    console.log('OK');
  } catch (e: any) {
    console.log('SKIP/ERR:', e?.message ?? e);
  }
}

async function main() {
  // 1. variety_status enum
  await exec(
    'create variety_status enum',
    `DO $$ BEGIN
        CREATE TYPE variety_status AS ENUM ('AVAILABLE', 'OUT_OF_SEASON', 'SOLD_OUT');
     EXCEPTION WHEN duplicate_object THEN NULL; END $$;`
  );

  // 2. varieties table
  await exec(
    'create varieties table',
    `CREATE TABLE IF NOT EXISTS varieties (
       id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
       name varchar(80) NOT NULL UNIQUE,
       description text NOT NULL,
       image varchar(500) NOT NULL,
       price_per_kg numeric(10,2) NOT NULL,
       allowed_weights varchar(80) NOT NULL DEFAULT '1,5,10',
       status variety_status NOT NULL DEFAULT 'AVAILABLE',
       sort_order integer NOT NULL DEFAULT 0,
       is_active boolean NOT NULL DEFAULT true,
       created_at timestamp NOT NULL DEFAULT now(),
       updated_at timestamp NOT NULL DEFAULT now()
     );`
  );

  // 3. Convert order_items.variety from mango_variety enum to varchar(80).
  // Postgres allows USING expr to cast enum → text.
  await exec(
    'order_items.variety enum -> varchar(80)',
    `ALTER TABLE order_items
       ALTER COLUMN variety TYPE varchar(80)
       USING variety::text;`
  );

  // 4. Drop the obsolete enum (best-effort; ok if still referenced or already gone)
  await exec('drop mango_variety enum', `DROP TYPE IF EXISTS mango_variety;`);

  console.log('Done.');
}

main().catch((e) => {
  console.error('Migration failed:', e);
  process.exit(1);
});
