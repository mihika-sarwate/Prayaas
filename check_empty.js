const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://postgres.mmxdvruucggeixjqwsqr:Adonisgroma%402026@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres' });
client.connect().then(async () => {
  const res = await client.query(`
    SELECT id, emp_name, date, remarks, created_at
    FROM reports
    WHERE emp_id IS NULL OR emp_id = '' OR emp_name IS NULL OR emp_name = ''
    LIMIT 10;
  `);
  console.log('Empty emp_id/name in reports:', res.rows);
  
  const res2 = await client.query(`
    SELECT id, date, attendance_status, employee_id
    FROM attendance
    WHERE employee_id IS NULL OR employee_id = '' OR date IS NULL
    LIMIT 10;
  `);
  console.log('Empty in attendance:', res2.rows);

  await client.end();
}).catch(console.error);
