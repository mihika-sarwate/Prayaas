const { Client } = require('pg');

const client = new Client({
  connectionString: "postgresql://postgres.mmxdvruucggeixjqwsqr:Adonisgroma%402026@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres"
});

async function run() {
  await client.connect();

  const policies = [
    // 1. attendance policies
    `
    ALTER POLICY attendance_self_all ON attendance USING (
      EXISTS (
        SELECT 1 FROM employees e 
        WHERE e.id = auth_employee_id() 
          AND e.pwd = auth_employee_pwd() 
          AND e.status = 'Active'
          AND UPPER(employee_id) = e.id
      )
    ) WITH CHECK (
      EXISTS (
        SELECT 1 FROM employees e 
        WHERE e.id = auth_employee_id() 
          AND e.pwd = auth_employee_pwd() 
          AND e.status = 'Active'
          AND UPPER(employee_id) = e.id
      )
    );
    `,
    `
    ALTER POLICY attendance_manager_all ON attendance USING (
      EXISTS (
        SELECT 1 FROM employees e 
        WHERE e.id = auth_employee_id() 
          AND e.pwd = auth_employee_pwd() 
          AND e.status = 'Active'
          AND EXISTS (
            SELECT 1 FROM employees sub 
            WHERE sub.id = employee_id 
              AND sub.manager_id = e.id
          )
      )
    ) WITH CHECK (
      EXISTS (
        SELECT 1 FROM employees e 
        WHERE e.id = auth_employee_id() 
          AND e.pwd = auth_employee_pwd() 
          AND e.status = 'Active'
          AND EXISTS (
            SELECT 1 FROM employees sub 
            WHERE sub.id = employee_id 
              AND sub.manager_id = e.id
          )
      )
    );
    `,

    // 2. reports policies
    `
    ALTER POLICY reports_self_all ON reports USING (
      EXISTS (
        SELECT 1 FROM employees e 
        WHERE e.id = auth_employee_id() 
          AND e.pwd = auth_employee_pwd() 
          AND e.status = 'Active'
          AND UPPER(emp_id) = e.id
      )
    ) WITH CHECK (
      EXISTS (
        SELECT 1 FROM employees e 
        WHERE e.id = auth_employee_id() 
          AND e.pwd = auth_employee_pwd() 
          AND e.status = 'Active'
          AND UPPER(emp_id) = e.id
      )
    );
    `,
    `
    ALTER POLICY reports_manager_all ON reports USING (
      EXISTS (
        SELECT 1 FROM employees e 
        WHERE e.id = auth_employee_id() 
          AND e.pwd = auth_employee_pwd() 
          AND e.status = 'Active'
          AND EXISTS (
            SELECT 1 FROM employees sub 
            WHERE sub.id = emp_id 
              AND sub.manager_id = e.id
          )
      )
    ) WITH CHECK (
      EXISTS (
        SELECT 1 FROM employees e 
        WHERE e.id = auth_employee_id() 
          AND e.pwd = auth_employee_pwd() 
          AND e.status = 'Active'
          AND EXISTS (
            SELECT 1 FROM employees sub 
            WHERE sub.id = emp_id 
              AND sub.manager_id = e.id
          )
      )
    );
    `,

    // 3. sfc policies
    `
    ALTER POLICY sfc_self_all ON sfc USING (
      EXISTS (
        SELECT 1 FROM employees e 
        WHERE e.id = auth_employee_id() 
          AND e.pwd = auth_employee_pwd() 
          AND e.status = 'Active'
          AND UPPER(emp_id) = e.id
      )
    ) WITH CHECK (
      EXISTS (
        SELECT 1 FROM employees e 
        WHERE e.id = auth_employee_id() 
          AND e.pwd = auth_employee_pwd() 
          AND e.status = 'Active'
          AND UPPER(emp_id) = e.id
      )
    );
    `,
    `
    ALTER POLICY sfc_manager_all ON sfc USING (
      EXISTS (
        SELECT 1 FROM employees e 
        WHERE e.id = auth_employee_id() 
          AND e.pwd = auth_employee_pwd() 
          AND e.status = 'Active'
          AND EXISTS (
            SELECT 1 FROM employees sub 
            WHERE sub.id = emp_id 
              AND sub.manager_id = e.id
          )
      )
    ) WITH CHECK (
      EXISTS (
        SELECT 1 FROM employees e 
        WHERE e.id = auth_employee_id() 
          AND e.pwd = auth_employee_pwd() 
          AND e.status = 'Active'
          AND EXISTS (
            SELECT 1 FROM employees sub 
            WHERE sub.id = emp_id 
              AND sub.manager_id = e.id
          )
      )
    );
    `,

    // 4. samples_inventory policies
    `
    ALTER POLICY samples_inventory_self_all ON samples_inventory USING (
      EXISTS (
        SELECT 1 FROM employees e 
        WHERE e.id = auth_employee_id() 
          AND e.pwd = auth_employee_pwd() 
          AND e.status = 'Active'
          AND UPPER(emp_id) = e.id
      )
    ) WITH CHECK (
      EXISTS (
        SELECT 1 FROM employees e 
        WHERE e.id = auth_employee_id() 
          AND e.pwd = auth_employee_pwd() 
          AND e.status = 'Active'
          AND UPPER(emp_id) = e.id
      )
    );
    `,
    `
    ALTER POLICY samples_inventory_manager_all ON samples_inventory USING (
      EXISTS (
        SELECT 1 FROM employees e 
        WHERE e.id = auth_employee_id() 
          AND e.pwd = auth_employee_pwd() 
          AND e.status = 'Active'
          AND EXISTS (
            SELECT 1 FROM employees sub 
            WHERE sub.id = emp_id 
              AND sub.manager_id = e.id
          )
      )
    ) WITH CHECK (
      EXISTS (
        SELECT 1 FROM employees e 
        WHERE e.id = auth_employee_id() 
          AND e.pwd = auth_employee_pwd() 
          AND e.status = 'Active'
          AND EXISTS (
            SELECT 1 FROM employees sub 
            WHERE sub.id = emp_id 
              AND sub.manager_id = e.id
          )
      )
    );
    `
  ];

  for (const q of policies) {
    try {
      await client.query(q);
      console.log("Successfully updated policy to use direct optimized subquery!");
    } catch (e) {
      console.error("Failed to update policy:", e.message);
    }
  }

  await client.end();
}

run().catch(console.error);
