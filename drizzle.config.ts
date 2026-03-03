import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({ path: ".env.local" }); // ここ重要（Windowsだと特に）

const databaseUrl = process.env.TURSO_DATABASE_URL?.trim();
const authToken = process.env.TURSO_AUTH_TOKEN?.trim();

if (!databaseUrl) {
  throw new Error("Missing TURSO_DATABASE_URL in .env.local");
}

if (!authToken) {
  throw new Error("Missing TURSO_AUTH_TOKEN in .env.local");
}

export default defineConfig({
  schema: "./src/server/db/schema.ts",
  out: "./drizzle",
  dialect: "turso",
  dbCredentials: {
    url: databaseUrl,
    authToken,
  },
});
