const { Client } = require('pg');
const client = new Client({ connectionString: "postgresql://postgres.mmxdvruucggeixjqwsqr:Adonisgroma%402026@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres" });

const sql = `
DROP POLICY IF EXISTS "attendance_admin_all" ON attendance;
DROP POLICY IF EXISTS "attendance_manager_all" ON attendance;
DROP POLICY IF EXISTS "attendance_self_all" ON attendance;

CREATE POLICY "attendance_admin_all" ON attendance FOR ALL TO public
USING (( SELECT is_admin() AS is_admin ))
WITH CHECK (( SELECT is_admin() AS is_admin ));

CREATE POLICY "attendance_manager_all" ON attendance FOR ALL TO public
USING ((( SELECT is_valid_employee() AS is_valid_employee) AND (upper(employee_id) = ANY (get_my_subordinates()))))
WITH CHECK ((( SELECT is_valid_employee() AS is_valid_employee) AND (upper(employee_id) = ANY (get_my_subordinates()))));

CREATE POLICY "attendance_self_all" ON attendance FOR ALL TO public
USING ((( SELECT is_valid_employee() AS is_valid_employee) AND (upper(employee_id) = upper(auth_employee_id()))))
WITH CHECK ((( SELECT is_valid_employee() AS is_valid_employee) AND (upper(employee_id) = upper(auth_employee_id()))));
`;

async function run() {
  await client.connect();
  await client.query(sql);
  console.log("Replaced attendance RLS policies to fix 500 error and match reports table pattern.");
  await client.end();
}
run().catch(console.error);
