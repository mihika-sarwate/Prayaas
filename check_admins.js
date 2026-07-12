const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://postgres.mmxdvruucggeixjqwsqr:Adonisgroma%402026@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres' });
client.connect().then(async () => {
  const res = await client.query(`
    SELECT id, name, role, status, pwd FROM employees WHERE role = 'admin';
  `);
  console.log('Admins:', res.rows);
  await client.end();
}).catch(console.error);
