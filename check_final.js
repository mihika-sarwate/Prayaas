require('dotenv').config();
const { Client } = require('pg');

async function run() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  const d = '2026-07-11';
  const reportsRes = await client.query(`SELECT emp_id, remarks FROM reports WHERE date = $1`, [d]);
  
  let totalSubmitted = 0;
  let finalCount = 0;
  let emps = new Set();
  let finalEmps = new Set();
  
  for (let r of reportsRes.rows) {
    emps.add(r.emp_id);
    let isFinal = false;
    try {
      const parts = r.remarks.split('\n===METADATA===\n');
      if (parts.length > 1) {
        const meta = JSON.parse(parts[1]);
        if (meta.isFinal === true) {
          isFinal = true;
          finalEmps.add(r.emp_id);
        }
      }
    } catch (e) {}
  }
  
  console.log(`Total Emps with Reports: ${emps.size}`);
  console.log(`Total Emps with Final Reports: ${finalEmps.size}`);
  
  await client.end();
}
run();
