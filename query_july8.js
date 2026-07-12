const { Client } = require('pg'); 
const client = new Client({connectionString: 'postgresql://postgres.mmxdvruucggeixjqwsqr:Adonisgroma%402026@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres'}); 
async function run() { 
  await client.connect(); 
  const res = await client.query("SELECT count(id) FROM reports WHERE date = '2026-07-08'"); 
  console.log('All July 8 reports:', res.rows[0].count); 
  await client.end(); 
} 
run().catch(console.error);
