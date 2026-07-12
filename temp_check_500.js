const { Client } = require('pg');
const client = new Client({ connectionString: "postgresql://postgres.mmxdvruucggeixjqwsqr:Adonisgroma%402026@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres" });
async function run() {
  await client.connect();
  // bypass RLS just to get the password
  const res0 = await client.query("SELECT pwd FROM employees WHERE id = 'ADLA101V'");
  const pwd = res0.rows[0]?.pwd || 'unknown';
  
  await client.query("SET request.jwt.claim.emp_id = 'ADLA101V'");
  await client.query(`SET request.jwt.claim.emp_pwd = '${pwd}'`);
  
  try {
    const res = await client.query("SELECT * FROM attendance LIMIT 5");
    console.log(res.rows);
  } catch (e) {
    console.error("SELECT Error:", e);
  }
  
  await client.end();
}
run().catch(console.error);
