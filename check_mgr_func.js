const { Client } = require('pg');

const client = new Client({
  connectionString: "postgresql://postgres.mmxdvruucggeixjqwsqr:Adonisgroma%402026@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres"
});

async function run() {
  await client.connect();
  const res = await client.query(`
    SELECT prosrc FROM pg_proc WHERE proname = 'get_my_managers'
  `);
  console.log(res.rows[0].prosrc);
  await client.end();
}

run().catch(console.error);
