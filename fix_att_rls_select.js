const pg = require('pg');
const { Client } = pg;
require('dotenv').config();

async function fixRls() {
  const client = new Client({ connectionString: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/postgres' });
  await client.connect();

  console.log("=== FIXING ATTENDANCE RLS ===");

  try {
    await client.query(`
      DROP POLICY IF EXISTS "attendance_admin_all" ON attendance;
      DROP POLICY IF EXISTS "attendance_manager_all" ON attendance;
      DROP POLICY IF EXISTS "attendance_self_all" ON attendance;
    `);

    // Add SELECT-only policies
    await client.query(`
      CREATE POLICY "attendance_select_all" ON attendance
        FOR SELECT
        USING (is_valid_employee());
    `);
    
    console.log("✅ Fixed RLS. Attendance table is now read-only for clients.");
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}

fixRls().catch(console.error);
