const { Client } = require('pg');

const client = new Client({
  connectionString: "postgresql://postgres.mmxdvruucggeixjqwsqr:Adonisgroma%402026@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres"
});

async function run() {
  await client.connect();
  try {
    await client.query("SET request.jwt.claim.emp_id = 'ADLA100'");
    await client.query("SET request.jwt.claim.emp_pwd = 'pass'"); // just need something
    // simulate authenticated user
    const res = await client.query('SELECT * FROM reports LIMIT 1');
    console.log(res.rows);
  } catch(e) {
    console.error("Error executing query:", e.message);
  }
  await client.end();
}

run().catch(console.error);
