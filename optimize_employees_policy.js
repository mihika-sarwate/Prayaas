const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://postgres.mmxdvruucggeixjqwsqr:Adonisgroma%402026@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres' });
client.connect().then(async () => {
  console.log('Altering employees_manager_read policy...');
  await client.query(`
    ALTER POLICY employees_manager_read ON employees 
    USING (
      (SELECT is_admin()) OR (
        (SELECT is_valid_employee()) AND (
          upper(id) = upper(auth_employee_id()) OR 
          id IN (SELECT unnest(get_my_managers())) OR 
          id IN (SELECT unnest(get_my_subordinates()))
        )
      )
    );
  `);
  console.log('Employees manager policy optimized successfully!');
  await client.end();
}).catch(console.error);
