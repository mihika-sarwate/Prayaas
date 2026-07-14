const { Client } = require('pg');
const fs = require('fs');

async function run() {
  const env = fs.readFileSync('.env', 'utf8');
  const dbUrl = env.match(/DATABASE_URL=(.*)/)[1];
  
  const client = new Client({ connectionString: dbUrl });
  await client.connect();
  
  try {
    // We will drop the existing read_all policy and replace it with an all-encompassing policy for valid employees
    await client.query(`DROP POLICY IF EXISTS "announcements_read_all" ON announcements;`);
    await client.query(`
      CREATE POLICY "announcements_emp_all" ON announcements
      FOR ALL
      TO public
      USING (is_valid_employee())
      WITH CHECK (is_valid_employee());
    `);
    
    console.log("Policy updated successfully.");
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await client.end();
  }
}

run();
