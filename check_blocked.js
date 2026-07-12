const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://postgres.mmxdvruucggeixjqwsqr:Adonisgroma%402026@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres' });
client.connect().then(async () => {
  const res = await client.query(`
    SELECT COUNT(*) as blocked_count
    FROM employees
    WHERE account_status = 'BLOCKED'
  `);
  console.log('Blocked employees:', res.rows[0].blocked_count);
  await client.end();
}).catch(console.error);
