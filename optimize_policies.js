const { Client } = require('pg');

const client = new Client({
  connectionString: "postgresql://postgres.mmxdvruucggeixjqwsqr:Adonisgroma%402026@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres"
});

async function run() {
  await client.connect();

  const tables = ['doctors', 'chemists', 'stockists'];

  for (const t of tables) {
    const sql = `
      ALTER POLICY ${t}_assigned_all ON ${t} USING (
        is_admin() OR
        (
          is_valid_employee() AND (
            UPPER(auth_employee_id()) = ANY(string_to_array(assign_to, ','))
            OR
            EXISTS (
              SELECT 1 FROM employees 
              WHERE manager_id = UPPER(auth_employee_id()) 
                AND id = ANY(string_to_array(assign_to, ','))
            )
          )
        )
      ) WITH CHECK (
        is_admin() OR
        (
          is_valid_employee() AND (
            UPPER(auth_employee_id()) = ANY(string_to_array(assign_to, ','))
            OR
            EXISTS (
              SELECT 1 FROM employees 
              WHERE manager_id = UPPER(auth_employee_id()) 
                AND id = ANY(string_to_array(assign_to, ','))
            )
          )
        )
      );
    `;
    try {
      await client.query(sql);
      console.log(`Successfully optimized policy for ${t}`);
    } catch (e) {
      console.error(`Failed to update policy for ${t}:`, e.message);
    }
  }

  await client.end();
}

run().catch(console.error);
