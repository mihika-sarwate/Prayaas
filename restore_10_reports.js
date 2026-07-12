const { Client } = require('pg'); 
const client = new Client({connectionString: 'postgresql://postgres.mmxdvruucggeixjqwsqr:Adonisgroma%402026@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres'}); 
async function run() { 
  await client.connect(); 
  const ids = [
    'REP1783606103582', 'REP1783606213588', 'REP1783606285721', 'REP1783606335526', 'REP1783606367400',
    'REP1783606413269', 'REP1783606445008', 'REP1783606483263', 'REP1783606529999', 'REP1783606570833'
  ];
  for (let id of ids) {
    await client.query("UPDATE reports SET date = '2026-07-09' WHERE id = $1", [id]);
  }
  console.log("Restored 10 reports to 2026-07-09");
  await client.end(); 
} 
run().catch(console.error);
