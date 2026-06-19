const { Client } = require('pg');

const client = new Client('postgresql://postgres:Prayaas_Adonis@db.ajifnoazcvxvpyzlusuy.supabase.co:5432/postgres');

async function setup() {
  try {
    await client.connect();
    console.log("Connected to PostgreSQL");

    const res = await client.query(`SELECT column_name FROM information_schema.columns WHERE table_name = 'doctors';`);
    console.log("Doctors columns:", res.rows.map(r => r.column_name));

    // Update doctors table
    await client.query(`
      ALTER TABLE doctors
      ADD COLUMN IF NOT EXISTS be_name text,
      ADD COLUMN IF NOT EXISTS hq text,
      ADD COLUMN IF NOT EXISTS manager_name text,
      ADD COLUMN IF NOT EXISTS state text,
      ADD COLUMN IF NOT EXISTS territory_type text;
    `);
    console.log("Updated doctors table schema.");

    // Create stockists table if not exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS stockists (
        id text primary key,
        name text not null,
        area text,
        assign_to text references employees(id)
      );
      ALTER TABLE stockists DISABLE ROW LEVEL SECURITY;
    `);
    console.log("Created stockists table and disabled RLS.");

  } catch (err) {
    console.error("Error:", err);
  } finally {
    await client.end();
  }
}

setup();
