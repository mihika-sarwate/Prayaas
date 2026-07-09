const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://postgres.mmxdvruucggeixjqwsqr:Adonisgroma%402026@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres' });
client.connect().then(async () => {
  console.log('Altering reports_manager_all policy...');
  await client.query(`
    ALTER POLICY reports_manager_all ON reports 
    USING (
      (SELECT is_valid_employee()) AND 
      (upper(emp_id) IN (SELECT unnest(get_my_subordinates())))
    )
    WITH CHECK (
      (SELECT is_valid_employee()) AND 
      (upper(emp_id) IN (SELECT unnest(get_my_subordinates())))
    );
  `);
  console.log('Policy altered successfully!');
  await client.end();
}).catch(console.error);
