require('dotenv').config();
const { Client } = require('pg');

async function run() {
  const client = new Client({ connectionString: process.env.DATABASE_URL || 'postgresql://postgres.mmxdvruucggeixjqwsqr:Adonisgroma%402026@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres' });
  await client.connect();

  const dates = ['2026-07-13', '2026-07-12', '2026-07-11', '2026-07-10', '2026-07-09', '2026-07-08'];

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
        let metaStr = null;
        if (row.remarks.includes('===METADATA===')) {
          metaStr = row.remarks.split('===METADATA===')[1].trim();
        }
        if (metaStr) {
          const meta = JSON.parse(metaStr);
          if (meta.isFinal === true || meta.isFinal === 'true') {
            empStatus[row.emp_id].hasFinal = true;
          }
        }
      } catch (e) {
        // console.error(e);
      }
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
    
    console.log(`Date: ${dateStr} - Total Emps with Reports: ${Object.keys(empStatus).length} | Final Submit: ${finalSubmitCount} | Did NOT Final Submit: ${notFinalSubmitCount}`);
  }

  await client.end();
}
run();
