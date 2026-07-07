const { Client } = require('pg');

const client = new Client({
  connectionString: "postgresql://postgres.mmxdvruucggeixjqwsqr:Adonisgroma%402026@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres"
});

async function run() {
  await client.connect();
  const res = await client.query(`
    SELECT polname, pg_get_expr(polqual, polrelid) as qual
    FROM pg_policy
    WHERE polrelid = 'employees'::regclass
  `);
  console.log(res.rows);
  await client.end();
}

run().catch(console.error);
