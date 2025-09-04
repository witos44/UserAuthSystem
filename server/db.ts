import "dotenv/config";
import { Client } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set");
}

// 🔹 Inisialisasi client PostgreSQL
const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

// 🔹 Connect ke database
await client.connect();

// 🔹 Buat instance drizzle dengan client
export const db = drizzle(client);
