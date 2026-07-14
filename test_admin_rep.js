require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
// Note: process.env.SUPABASE_KEY is the service role key or anon key?
// Let's use PostgreSQL directly with admin role logic.
const pg = require('pg');
const c = new pg.Client(process.env.DATABASE_URL);
c.connect().then(async () => {
  // Check if admin RLS allows seeing this
  await c.query("SET SESSION AUTHORIZATION 'authenticated'");
  await c.query("SET request.jwt.claim.role = 'admin'");
  await c.query("SET request.jwt.claim.email = 'admin@yoursite.com'");
  await c.query("SET request.jwt.claim.sub = 'some-uuid'");
  // Or actually, maybe I didn't set up the JWT correctly here. Let's just do a normal query to see if the policy blocks it.
  const res = await c.query("SELECT * FROM reports WHERE emp_id = 'TEST01' AND date LIKE '2026-07-12%'");
  console.log("Admin RLS fetch:", res.rows.length);
  c.end();
});
