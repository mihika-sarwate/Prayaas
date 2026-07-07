const { Client } = require('pg');

const client = new Client({
  connectionString: "postgresql://postgres.mmxdvruucggeixjqwsqr:Adonisgroma%402026@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres"
});

async function run() {
  await client.connect();
  
  try {
    // Drop the policies
    await client.query("DROP POLICY IF EXISTS reports_manager_all ON reports");
    await client.query("DROP POLICY IF EXISTS reports_self_all ON reports");
    
    // Create optimized secure policies
    await client.query(`
      CREATE POLICY reports_manager_all ON reports
      FOR ALL
      USING (
        (SELECT is_valid_employee()) AND upper(emp_id) = ANY (get_my_subordinates())
      )
      WITH CHECK (
        (SELECT is_valid_employee()) AND upper(emp_id) = ANY (get_my_subordinates())
      )
    `);
    
    await client.query(`
      CREATE POLICY reports_self_all ON reports
      FOR ALL
      USING (
        (SELECT is_valid_employee()) AND upper(emp_id) = upper(auth_employee_id())
      )
      WITH CHECK (
        (SELECT is_valid_employee()) AND upper(emp_id) = upper(auth_employee_id())
      )
    `);
    
    console.log("Policies optimized and secured successfully");
  } catch(e) {
    console.error("Error updating policy:", e.message);
  }
  
  await client.end();
}

run().catch(console.error);
