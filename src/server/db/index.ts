import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";

const databaseUrl = process.env.TURSO_DATABASE_URL?.trim();
const authToken = process.env.TURSO_AUTH_TOKEN?.trim();

if (!databaseUrl) {
  throw new Error("Missing TURSO_DATABASE_URL");
}

const client = createClient({
  url: databaseUrl,
  authToken,
});

export const db = drizzle(client);
