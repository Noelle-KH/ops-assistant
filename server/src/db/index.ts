import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "./schema";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const dbUrl = process.env.DB_URL || `file:${path.join(process.cwd(), "sqlite.db")}`;
console.log(`[DB] Connecting to: ${dbUrl ? dbUrl.split('@').pop() : 'local sqlite'}`);
const authToken = process.env.DB_AUTH_TOKEN;

const client = createClient({ 
  url: dbUrl,
  authToken: authToken 
});

export const db = drizzle(client, { schema });
