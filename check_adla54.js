const { Client } = require('pg');
const fs = require('fs');

async function run() {
  const env = fs.readFileSync('.env', 'utf8');
  const dbUrl = env.match(/DATABASE_URL=(.*)/)[1];
  
  const client = new Client({ connectionString: dbUrl });
  await client.connect();
  
  try {
    const res = await client.query("SELECT * FROM employees WHERE id = 'ADLA54'");
    console.log(res.rows[0]);
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await client.end();
  }
}

run();
