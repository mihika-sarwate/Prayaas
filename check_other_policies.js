const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://postgres.mmxdvruucggeixjqwsqr:Adonisgroma%402026@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres' });
client.connect().then(async () => {
  const res = await client.query(`
    SELECT tablename, policyname, permissive, roles, cmd, qual, with_check 
    FROM pg_policies 
    WHERE qual LIKE '%get_my_subordinates%' OR with_check LIKE '%get_my_subordinates%';
  `);
  console.log('Policies using get_my_subordinates:', res.rows);
  await client.end();
}).catch(console.error);
