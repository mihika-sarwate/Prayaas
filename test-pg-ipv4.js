const { Client } = require('pg');
require('dotenv').config();

async function run() {
  const dbUrl = process.env.DATABASE_URL.replace(':5432', ':6543');
  console.log("Connecting to:", dbUrl);
  const client = new Client({ connectionString: dbUrl });
  
  try {
    await client.connect();
    console.log("Connected successfully over IPv4!");
    
    // Check if we can insert attendance
    // const res = await client.query("SELECT * FROM attendance LIMIT 1;");
    // console.log(res.rows);
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await client.end();
  }
}

run();
