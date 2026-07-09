const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://postgres.mmxdvruucggeixjqwsqr:Adonisgroma%402026@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres' });
client.connect().then(async () => {
  const res = await client.query(`
    SELECT pg_get_functiondef(p.oid) as def
    FROM pg_proc p
    WHERE p.proname IN ('auth_employee_id', 'auth_employee_pwd', 'is_admin', 'is_valid_employee', 'get_my_subordinates', 'get_my_managers');
  `);
  res.rows.forEach(r => console.log(r.def));
  await client.end();
}).catch(console.error);
