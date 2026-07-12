const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://postgres.mmxdvruucggeixjqwsqr:Adonisgroma%402026@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres' });
client.connect().then(async () => {
  const res = await client.query(`
    SELECT pol.polname, pg_get_expr(pol.polqual, pol.polrelid) AS qual
    FROM pg_policy pol
    JOIN pg_class tbl ON pol.polrelid = tbl.oid
    WHERE tbl.relname = 'employees'
  `);
  console.log('Employees Policies:', res.rows);
  await client.end();
}).catch(console.error);
