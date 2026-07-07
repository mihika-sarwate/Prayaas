const { Client } = require('pg');

const client = new Client({
  connectionString: "postgresql://postgres.mmxdvruucggeixjqwsqr:Adonisgroma%402026@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres"
});

async function run() {
  await client.connect();
  
  // Set default for pwd so upserts without pwd don't fail the initial INSERT evaluation
  await client.query("ALTER TABLE employees ALTER COLUMN pwd SET DEFAULT 'pass123'");
  
  console.log("Database schema updated successfully");
  await client.end();
}

run().catch(console.error);
