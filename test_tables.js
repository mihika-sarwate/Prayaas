const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://aws-0-ap-northeast-1.pooler.supabase.com', 'dummy_key'); 
// Wait, I can't easily test Supabase JS without the key.
// I will just use pg to test if all tables exist!
const { Client } = require('pg'); 
const client = new Client({connectionString: 'postgresql://postgres.mmxdvruucggeixjqwsqr:Adonisgroma%402026@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres'}); 
async function run() { 
  await client.connect(); 
  const tables = [
    'employees', 'attendance', 'leaves', 'doctors', 'chemists', 'stockists',
    'reports', 'tour_plans', 'expenses', 'sfc', 'weekly_off_config', 'announcements'
  ];
  for (let t of tables) {
    try {
      const res = await client.query(`SELECT count(*) FROM ${t}`);
      console.log(`Table ${t} exists. Count: ${res.rows[0].count}`);
    } catch(e) {
      console.log(`Table ${t} FAILED:`, e.message);
    }
  }
  await client.end(); 
} 
run().catch(console.error);
