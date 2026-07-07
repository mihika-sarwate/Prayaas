const { Client } = require('pg');

const client = new Client({
  connectionString: "postgresql://postgres.mmxdvruucggeixjqwsqr:Adonisgroma%402026@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres"
});

async function run() {
  await client.connect();
  try {
    const res = await client.query("SELECT id, pwd FROM employees WHERE id = 'EMP001'");
    console.log("Current password for EMP001:", res.rows[0].pwd);
  } catch(e) {
    console.error("Error:", e.message);
  }
  await client.end();
}

run().catch(console.error);
