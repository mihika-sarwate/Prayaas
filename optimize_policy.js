const { Client } = require('pg');

const client = new Client({
  connectionString: "postgresql://postgres.mmxdvruucggeixjqwsqr:Adonisgroma%402026@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres"
});

async function run() {
  await client.connect();
  
  try {
    // Drop the slow policy
    await client.query("DROP POLICY IF EXISTS reports_manager_all ON reports");
    
    // Create an optimized policy using ANY(get_my_subordinates())
    // This evaluates get_my_subordinates() once instead of triggering nested RLS for every row
    await client.query(`
      CREATE POLICY reports_manager_all ON reports
      FOR ALL
      USING (
        upper(emp_id) = ANY (get_my_subordinates())
      )
      WITH CHECK (
        upper(emp_id) = ANY (get_my_subordinates())
      )
    `);
    
    console.log("Policy reports_manager_all optimized successfully");
  } catch(e) {
    console.error("Error updating policy:", e.message);
  }
  
  await client.end();
}

run().catch(console.error);
