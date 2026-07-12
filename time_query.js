const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://postgres.mmxdvruucggeixjqwsqr:Adonisgroma%402026@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres' });
client.connect().then(async () => {
  await client.query("SET request.headers = '{\"x-employee-id\": \"ADLA02\", \"x-employee-password\": \"ADLA02\"}'");
  
  console.time('Fetch page 0');
  const res0 = await client.query("SELECT count(*) FROM reports LIMIT 1000 OFFSET 0");
  console.timeEnd('Fetch page 0');
  
  console.time('Fetch page 6');
  try {
    const res6 = await client.query("SELECT count(*) FROM reports LIMIT 1000 OFFSET 6000");
    console.timeEnd('Fetch page 6');
    console.log('Page 6 count:', res6.rows[0].count);
  } catch (e) {
    console.timeEnd('Fetch page 6');
    console.error('Fetch page 6 failed:', e);
  }
  
  await client.end();
}).catch(console.error);
