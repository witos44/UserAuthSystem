import { Client } from 'pg';
import 'dotenv/config';

async function testDB() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log('✅ PostgreSQL connected successfully!');
    const res = await client.query('SELECT NOW() AS "current_time"');
    console.log(res.rows[0]);
  } catch (err) {
    console.error('❌ Connection failed:', err.message || err);
  } finally {
    await client.end();
  }
}

testDB();