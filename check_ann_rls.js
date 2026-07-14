const { Client } = require('pg');
const fs = require('fs');

async function run() {
  const env = fs.readFileSync('.env', 'utf8');
  const dbUrl = env.match(/DATABASE_URL=(.*)/)[1];
  
  const client = new Client({ connectionString: dbUrl });
  await client.connect();
  
  try {
    const res = await client.query("SELECT policyname, cmd, roles, qual, with_check FROM pg_policies WHERE tablename = 'announcements'");
    console.log(res.rows);
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await client.end();
  }
}

run();
