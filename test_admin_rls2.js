require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Must use ANON key so RLS applies!
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function testAdmin() {
  // Login as admin
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'admin@yoursite.com',
    password: 'password' // We don't know the exact password, let's query the DB for it or sign in.
  });
  console.log("Login error:", error);
}
testAdmin();
