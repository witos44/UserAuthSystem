// drizzle.config.ts
import type { Config } from 'drizzle-kit';

export default {
  schema: './shared/schema.ts',
  out: './drizzle',
  dialect: 'postgresql', // ← Use 'dialect', not 'driver'
  dbCredentials: {
    connectionString: process.env.DATABASE_URL!,
  },
} satisfies Config;