const { Client } = require('pg'); 
const client = new Client({connectionString: 'postgresql://postgres.mmxdvruucggeixjqwsqr:Adonisgroma%402026@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres'}); 
async function run() { 
  await client.connect(); 
  const res = await client.query("UPDATE reports SET date = '2026-07-08' WHERE emp_id = 'ADLA18' AND date = '2026-07-09'"); 
  console.log('Updated rows:', res.rowCount); 
  await client.end(); 
} 
run().catch(console.error);
