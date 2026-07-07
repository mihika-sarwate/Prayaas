const { Client } = require('pg');

const client = new Client({
  connectionString: "postgresql://postgres.mmxdvruucggeixjqwsqr:Adonisgroma%402026@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres"
});

async function run() {
  await client.connect();
  const queries = [
    // employees self reference
    `ALTER TABLE employees DROP CONSTRAINT employees_manager_id_fkey, ADD CONSTRAINT employees_manager_id_fkey FOREIGN KEY (manager_id) REFERENCES employees(id) ON UPDATE CASCADE ON DELETE SET NULL;`,
    
    // doctors, chemists, stockists
    `ALTER TABLE doctors DROP CONSTRAINT doctors_assign_to_fkey, ADD CONSTRAINT doctors_assign_to_fkey FOREIGN KEY (assign_to) REFERENCES employees(id) ON UPDATE CASCADE ON DELETE CASCADE;`,
    `ALTER TABLE chemists DROP CONSTRAINT chemists_assign_to_fkey, ADD CONSTRAINT chemists_assign_to_fkey FOREIGN KEY (assign_to) REFERENCES employees(id) ON UPDATE CASCADE ON DELETE CASCADE;`,
    `ALTER TABLE stockists DROP CONSTRAINT stockists_assign_to_fkey, ADD CONSTRAINT stockists_assign_to_fkey FOREIGN KEY (assign_to) REFERENCES employees(id) ON UPDATE CASCADE ON DELETE CASCADE;`,
    
    // reports
    `ALTER TABLE reports DROP CONSTRAINT reports_emp_id_fkey, ADD CONSTRAINT reports_emp_id_fkey FOREIGN KEY (emp_id) REFERENCES employees(id) ON UPDATE CASCADE ON DELETE CASCADE;`,
    `ALTER TABLE reports DROP CONSTRAINT reports_jfw_mgr_id_fkey, ADD CONSTRAINT reports_jfw_mgr_id_fkey FOREIGN KEY (jfw_mgr_id) REFERENCES employees(id) ON UPDATE CASCADE ON DELETE SET NULL;`,
    
    // tour_plans
    `ALTER TABLE tour_plans DROP CONSTRAINT tour_plans_emp_id_fkey, ADD CONSTRAINT tour_plans_emp_id_fkey FOREIGN KEY (emp_id) REFERENCES employees(id) ON UPDATE CASCADE ON DELETE CASCADE;`,
    `ALTER TABLE tour_plans DROP CONSTRAINT tour_plans_manager_id_fkey, ADD CONSTRAINT tour_plans_manager_id_fkey FOREIGN KEY (manager_id) REFERENCES employees(id) ON UPDATE CASCADE ON DELETE SET NULL;`,
    `ALTER TABLE tour_plans DROP CONSTRAINT tour_plans_approved_by_fkey, ADD CONSTRAINT tour_plans_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES employees(id) ON UPDATE CASCADE ON DELETE SET NULL;`,
    
    // expenses
    `ALTER TABLE expenses DROP CONSTRAINT expenses_emp_id_fkey, ADD CONSTRAINT expenses_emp_id_fkey FOREIGN KEY (emp_id) REFERENCES employees(id) ON UPDATE CASCADE ON DELETE CASCADE;`,
    `ALTER TABLE expenses DROP CONSTRAINT expenses_manager_id_fkey, ADD CONSTRAINT expenses_manager_id_fkey FOREIGN KEY (manager_id) REFERENCES employees(id) ON UPDATE CASCADE ON DELETE SET NULL;`,
    
    // leaves
    `ALTER TABLE leaves DROP CONSTRAINT leaves_emp_id_fkey, ADD CONSTRAINT leaves_emp_id_fkey FOREIGN KEY (emp_id) REFERENCES employees(id) ON UPDATE CASCADE ON DELETE CASCADE;`,
    `ALTER TABLE leaves DROP CONSTRAINT leaves_manager_id_fkey, ADD CONSTRAINT leaves_manager_id_fkey FOREIGN KEY (manager_id) REFERENCES employees(id) ON UPDATE CASCADE ON DELETE SET NULL;`,
    
    // inventory
    `ALTER TABLE samples_inventory DROP CONSTRAINT samples_inventory_emp_id_fkey, ADD CONSTRAINT samples_inventory_emp_id_fkey FOREIGN KEY (emp_id) REFERENCES employees(id) ON UPDATE CASCADE ON DELETE CASCADE;`,
    `ALTER TABLE gifts_inventory DROP CONSTRAINT gifts_inventory_emp_id_fkey, ADD CONSTRAINT gifts_inventory_emp_id_fkey FOREIGN KEY (emp_id) REFERENCES employees(id) ON UPDATE CASCADE ON DELETE CASCADE;`,
    `ALTER TABLE inputs_inventory DROP CONSTRAINT inputs_inventory_emp_id_fkey, ADD CONSTRAINT inputs_inventory_emp_id_fkey FOREIGN KEY (emp_id) REFERENCES employees(id) ON UPDATE CASCADE ON DELETE CASCADE;`
  ];
  
  for (const q of queries) {
    try {
      await client.query(q);
      console.log('Success:', q);
    } catch (e) {
      console.error('Error on query:', q, e.message);
    }
  }
  await client.end();
}

run().catch(console.error);
