const { Client } = require('pg');

const client = new Client({
  connectionString: "postgresql://postgres.mmxdvruucggeixjqwsqr:Adonisgroma%402026@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres"
});

async function run() {
  await client.connect();
  const res = await client.query(`
    UPDATE employees SET pwd = 'adonis@1234' WHERE id = 'ADMIN' OR role = 'admin';
  `);
  console.log("Admin password updated:", res.rowCount);
  await client.end();
}

run().catch(console.error);
