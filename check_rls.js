const { Client } = require('pg');
const fs = require('fs');
require('dotenv').config();

async function run() {
  const dbUrl = process.env.DATABASE_URL;
  const client = new Client({ connectionString: dbUrl });
  await client.connect();
  
  try {
    const res = await client.query("SELECT * FROM pg_policies WHERE tablename = 'attendance'");
    console.log(res.rows);
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await client.end();
  }
}

run();
