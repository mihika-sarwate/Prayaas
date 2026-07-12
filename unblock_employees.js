const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://postgres.mmxdvruucggeixjqwsqr:Adonisgroma%402026@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres' });
client.connect().then(async () => {
  const res = await client.query(`
    UPDATE employees 
    SET account_status = 'ACTIVE', blocked_date = NULL, blocked_reason = NULL 
    WHERE account_status = 'BLOCKED' AND blocked_reason = 'Final DCR not submitted by 12:00 AM IST'
  `);
  console.log('Unblocked employees:', res.rowCount);
  await client.end();
}).catch(console.error);
