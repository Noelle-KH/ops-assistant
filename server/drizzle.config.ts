import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";

dotenv.config();

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: process.env.DB_AUTH_TOKEN ? "turso" : "sqlite",
  dbCredentials: {
    url: process.env.DB_URL || "file:sqlite.db",
    authToken: process.env.DB_AUTH_TOKEN,
  },
});

