const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://postgres.mmxdvruucggeixjqwsqr:Adonisgroma%402026@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres' });
client.connect().then(async () => {
  const res = await client.query(`
    SELECT DISTINCT role FROM employees;
  `);
  console.log('Distinct roles:', res.rows);
  await client.end();
}).catch(console.error);
