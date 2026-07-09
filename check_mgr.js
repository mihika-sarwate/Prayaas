const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://postgres.mmxdvruucggeixjqwsqr:Adonisgroma%402026@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres' });
client.connect().then(async () => {
  const mgrRes = await client.query("SELECT * FROM employees WHERE name ILIKE '%MILIND SARWATE%'");
  console.log('Manager:', mgrRes.rows);
  if (mgrRes.rows.length > 0) {
    const mgrId = mgrRes.rows[0].id;
    const subsRes = await client.query("SELECT id, name, manager_id FROM employees WHERE manager_id = $1", [mgrId]);
    console.log('Subordinates by exact match:', subsRes.rows);
    const subsResLike = await client.query("SELECT id, name, manager_id FROM employees WHERE manager_id ILIKE $1", [`%${mgrId}%`]);
    console.log('Subordinates by ILIKE match:', subsResLike.rows);
  }
  await client.end();
}).catch(console.error);
