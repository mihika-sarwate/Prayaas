const { Client } = require('pg');
const client = new Client({ connectionString: "postgresql://postgres.mmxdvruucggeixjqwsqr:Adonisgroma%402026@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres" });
async function run() {
  await client.connect();
  const res = await client.query("SELECT prosrc FROM pg_proc WHERE proname = 'is_admin'");
  console.log(res.rows[0].prosrc);
  
  const res2 = await client.query("SELECT * FROM pg_policies WHERE tablename = 'holidays'");
  console.log(res2.rows);
  await client.end();
}
run().catch(console.error);
