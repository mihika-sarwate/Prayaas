const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://postgres.mmxdvruucggeixjqwsqr:Adonisgroma%402026@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres' });
client.connect().then(async () => {
  const res = await client.query(`
    SELECT a.employee_id, a.attendance_status, r.remarks
    FROM attendance a
    JOIN reports r ON a.employee_id = r.emp_id AND a.date = r.date
    WHERE a.date = '2026-07-08' AND a.attendance_status = 'A'
    LIMIT 5;
  `);
  console.log('Sample absent employees with reports:', res.rows);
  await client.end();
}).catch(console.error);
