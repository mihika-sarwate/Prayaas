const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://postgres.mmxdvruucggeixjqwsqr:Adonisgroma%402026@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres' });
client.connect().then(async () => {
  const res = await client.query(`
    SELECT remarks 
    FROM reports 
    WHERE remarks LIKE '%isFinal%'
    LIMIT 5;
  `);
  console.log('Sample remarks:', res.rows.map(r => r.remarks));
  await client.end();
}).catch(console.error);
