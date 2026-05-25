import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from 'ws';
import * as schema from './schema';
import * as relations from './relations';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is missing.');
}

// Configure the WebSocket constructor for Node.js environments
neonConfig.webSocketConstructor = ws;

// In local development, Next.js hot-reloads modules, which can recreate connection pools.
// We store the pool in a global variable to persist connections across reloads.
const globalForDb = globalThis as unknown as {
  conn: Pool | undefined;
};

const pool = globalForDb.conn ?? new Pool({ connectionString: process.env.DATABASE_URL });

if (process.env.NODE_ENV !== 'production') {
  globalForDb.conn = pool;
}

export const db = drizzle({ client: pool, schema: { ...schema, ...relations } });
