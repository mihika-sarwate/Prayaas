require('dotenv').config();
const { Client } = require('pg');

async function run() {
  const client = new Client({ connectionString: process.env.DATABASE_URL || 'postgresql://postgres.mmxdvruucggeixjqwsqr:Adonisgroma%402026@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres' });
  await client.connect();

  const res = await client.query(`SELECT remarks FROM reports LIMIT 5`);
  console.log(res.rows);

  await client.end();
}
run();
