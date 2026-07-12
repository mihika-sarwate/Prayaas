const { Client } = require('pg'); 
const client = new Client({connectionString: 'postgresql://postgres.mmxdvruucggeixjqwsqr:Adonisgroma%402026@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres'}); 
async function run() { 
  await client.connect(); 
  
  // Test as ADLA100
  await client.query("SET SESSION AUTHORIZATION authenticator");
  await client.query(`SET request.jwt.claim.emp_id = 'ADLA100'`);
  await client.query(`SET request.jwt.claim.role = 'admin'`);
  await client.query(`SET role = authenticated`);
  
  const res = await client.query("SELECT count(*) FROM reports"); 
  console.log("Admin can see:", res.rows[0].count); 
  
  await client.end(); 
} 
run().catch(console.error);
