const { Client } = require('pg'); 
const client = new Client({connectionString: 'postgresql://postgres.mmxdvruucggeixjqwsqr:Adonisgroma%402026@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres'}); 
async function run() { 
  await client.connect(); 
  const res = await client.query("SELECT id, created_at FROM reports WHERE emp_id = 'ADLA18' AND date = '2026-07-08' ORDER BY id"); 
  res.rows.forEach(r => console.log(r.id, r.created_at)); 
  await client.end(); 
} 
run().catch(console.error);
