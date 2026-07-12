const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://postgres.mmxdvruucggeixjqwsqr:Adonisgroma%402026@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres' });
client.connect().then(async () => {
  const res = await client.query(`
    SELECT date, COUNT(*) as count
    FROM reports
    GROUP BY date
    ORDER BY date DESC
    LIMIT 5;
  `);
  console.log('Reports per date:', res.rows);
  
  const res2 = await client.query(`
    SELECT emp_id, COUNT(*) as report_count
    FROM reports
    WHERE date = '2026-07-09'
    GROUP BY emp_id
    ORDER BY report_count DESC
    LIMIT 10;
  `);
  console.log('Top 10 reporters for today (2026-07-09):', res2.rows);

  const res3 = await client.query(`
    SELECT COUNT(*) as total_reports FROM reports WHERE date = '2026-07-09'
  `);
  console.log('Total reports today:', res3.rows[0].total_reports);

  await client.end();
}).catch(console.error);
