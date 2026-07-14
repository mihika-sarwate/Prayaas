const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://postgres.mmxdvruucggeixjqwsqr:Adonisgroma%402026@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres' });
client.connect().then(async () => {
  const attRes = await client.query("SELECT * FROM attendance WHERE date = '2026-07-13'");
  console.log('Total attendance records for today:', attRes.rowCount);
  
  const presentRes = await client.query("SELECT * FROM attendance WHERE date = '2026-07-13' AND attendance_status = 'P'");
  console.log('Present attendance records for today:', presentRes.rowCount);

  const reportRes = await client.query("SELECT count(*), is_final FROM reports WHERE DATE(created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Kolkata') = '2026-07-13' GROUP BY is_final");
  console.log('Reports for today by is_final:', reportRes.rows);

  client.end();
}).catch(console.error);
