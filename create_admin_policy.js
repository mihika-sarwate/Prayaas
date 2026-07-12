const { Client } = require('pg');

const client = new Client({
  connectionString: "postgresql://postgres.mmxdvruucggeixjqwsqr:Adonisgroma%402026@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres"
});

async function run() {
  await client.connect();
  try {
    await client.query(`
      CREATE POLICY reports_admin_all ON reports
      FOR ALL
      USING (
        (SELECT is_valid_employee()) AND 
        (SELECT role FROM employees WHERE id = auth_employee_id()) = 'admin'
      )
      WITH CHECK (
        (SELECT is_valid_employee()) AND 
        (SELECT role FROM employees WHERE id = auth_employee_id()) = 'admin'
      )
    `);
    console.log("Admin policy created successfully");
  } catch(e) {
    console.error("Error updating policy:", e.message);
  }
  await client.end();
}

run().catch(console.error);
