require('dotenv').config();
const { Client } = require('pg');

async function run() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  const dates = await client.query(`SELECT DISTINCT date FROM reports ORDER BY date DESC LIMIT 5`);
  for (let dateRow of dates.rows) {
    const d = dateRow.date;
    const reportsRes = await client.query(`SELECT COUNT(DISTINCT emp_id) as submitted_count FROM reports WHERE date = $1`, [d]);
    const presentRes = await client.query(`SELECT COUNT(*) as present_count FROM attendance WHERE date = $1 AND attendance_status = 'P'`, [d]);
    console.log(`Date: ${d} | Submitted: ${reportsRes.rows[0].submitted_count} | Present: ${presentRes.rows[0].present_count}`);
  }
  
  await client.end();
}
run();
