const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://postgres.mmxdvruucggeixjqwsqr:Adonisgroma%402026@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres' });
client.connect().then(async () => {
  try {
    const res = await client.query("SELECT * FROM employees WHERE id = 'ADLA124V' OR name ILIKE '%Sanku%'");
    console.log(res.rows);
  } catch(e) {
    console.error(e);
  }
  client.end();
});
