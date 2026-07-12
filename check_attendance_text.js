const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://postgres.mmxdvruucggeixjqwsqr:Adonisgroma%402026@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres' });
client.connect().then(async () => {
  const res = await client.query(`
    SELECT date::text, COUNT(*) as absent_count
    FROM attendance
    WHERE attendance_status = 'A' OR attendance_status = 'Absent'
    GROUP BY date::text
    ORDER BY date::text DESC
    LIMIT 5;
  `);
  console.log('Absent records per date text:', res.rows);
  await client.end();
}).catch(console.error);
