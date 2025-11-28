// 🔥 Load environment variables FIRST — before anything else
import 'dotenv/config';

import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from 'ws';
import * as schema from '@shared/schema';

// Required for serverless WebSocket connections
neonConfig.webSocketConstructor = ws;

// Validate database URL early
const url = process.env.DATABASE_URL;
if (!url || url.trim() === '') {
  throw new Error(
    "❌ DATABASE_URL is missing. Add it to your .env file. Example:\n" +
    "DATABASE_URL=postgres://user:password@host/db?sslmode=require"
  );
}

// Create reusable Neon pool
export const pool = new Pool({
  connectionString: url,
});

// Initialize Drizzle ORM
export const db = drizzle({
  client: pool,
  schema,
});


export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle({ client: pool, schema });
