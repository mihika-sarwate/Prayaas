const { Client } = require('pg');
const client = new Client({ connectionString: "postgresql://postgres.mmxdvruucggeixjqwsqr:Adonisgroma%402026@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres" });
async function run() {
  await client.connect();
  const res = await client.query("SELECT proname, prosecdef FROM pg_proc WHERE proname IN ('get_my_managers', 'get_my_subordinates')");
  console.log(res.rows);
  await client.end();
}
run().catch(console.error);
