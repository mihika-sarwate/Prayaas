require('dotenv').config();
const { Client } = require('pg');

async function run() {
  const client = new Client({ connectionString: process.env.DATABASE_URL || 'postgresql://postgres.mmxdvruucggeixjqwsqr:Adonisgroma%402026@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres' });
  await client.connect();

  const dates = ['2026-07-12', '2026-07-13', '2026-07-11', '2026-07-10', '2026-07-09'];

  for (const dateStr of dates) {
    const res = await client.query(`
      SELECT emp_id, remarks 
      FROM reports 
      WHERE date = $1
    `, [dateStr]);

    const empStatus = {};
    for (const row of res.rows) {
      if (!empStatus[row.emp_id]) {
        empStatus[row.emp_id] = { hasReports: true, hasFinal: false };
      }
      
      try {
        const parts = row.remarks.split('\\n===METADATA===\\n');
        if (parts.length > 1) {
          const meta = JSON.parse(parts[1]);
          if (meta.isFinal === true) {
            empStatus[row.emp_id].hasFinal = true;
          }
        }
      } catch (e) {}
    }

    let finalSubmitCount = 0;
    let notFinalSubmitCount = 0;
    for (const empId in empStatus) {
      if (empStatus[empId].hasFinal) {
        finalSubmitCount++;
      } else {
        notFinalSubmitCount++;
      }
    }
    
    console.log(`Date: ${dateStr} - Reports from ${Object.keys(empStatus).length} employees. Final Submit: ${finalSubmitCount}, Did Not Final Submit: ${notFinalSubmitCount}`);
  }

  await client.end();
}
run();
