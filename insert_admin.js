const { Client } = require('pg');

const client = new Client({
  connectionString: "postgresql://postgres.mmxdvruucggeixjqwsqr:Adonisgroma%402026@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres"
});

async function run() {
  await client.connect();
  const res = await client.query(`
    INSERT INTO employees (id, name, pwd, role, status, account_status)
    VALUES ('ADMIN', 'System Administrator', 'admin123', 'admin', 'Active', 'ACTIVE')
    ON CONFLICT (id) DO UPDATE SET role = 'admin', pwd = 'admin123';
  `);
  console.log("Admin user created/updated:", res.rowCount);
  await client.end();
}

run().catch(console.error);
