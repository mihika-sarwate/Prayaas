const { Client } = require('pg');

const client = new Client({
  connectionString: "postgresql://postgres.mmxdvruucggeixjqwsqr:Adonisgroma%402026@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres"
});

async function run() {
  await client.connect();
  try {
    // Attempt an upsert using supabase REST api equivalent logic
    const res = await client.query(`
      INSERT INTO employees (id, name, role)
      VALUES ('EMP001', 'Test', 'EMP')
      ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name
    `);
    console.log("Success:", res.rowCount);
  } catch(e) {
    console.error("Error:", e.message);
  }
  await client.end();
}

run().catch(console.error);
