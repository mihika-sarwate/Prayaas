const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://postgres.mmxdvruucggeixjqwsqr:Adonisgroma%402026@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres' });
client.connect().then(async () => {
  const res = await client.query(`
    SELECT conname 
    FROM pg_constraint 
    WHERE conrelid = 'attendance'::regclass AND contype = 'u';
  `);
  console.log('Unique constraints on attendance:', res.rows);
  await client.end();
}).catch(console.error);
