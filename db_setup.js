const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

function loadEnv() {
  try {
    const envPath = path.resolve(__dirname, '.env');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      envContent.split(/\r?\n/).forEach(line => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
          const firstEqual = trimmed.indexOf('=');
          if (firstEqual !== -1) {
            const key = trimmed.slice(0, firstEqual).trim();
            const val = trimmed.slice(firstEqual + 1).trim();
            process.env[key] = val;
          }
        }
      });
    }
  } catch (err) {
    console.error("Warning: Could not load .env file", err);
  }
}
loadEnv();

const client = new Client(process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/postgres');

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
