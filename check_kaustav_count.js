const { Client } = require('pg');

const client = new Client({
  connectionString: "postgresql://postgres.mmxdvruucggeixjqwsqr:Adonisgroma%402026@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres"
});

async function run() {
  await client.connect();
  try {
    const pwdRes = await client.query("SELECT pwd FROM employees WHERE id = 'ADWBRSM2'");
    const actualPwd = pwdRes.rows[0].pwd;
    
    await client.query("SET ROLE authenticated");
    await client.query("SET request.jwt.claim.emp_id = 'ADWBRSM2'");
    await client.query("SET request.jwt.claim.emp_pwd = '" + actualPwd + "'");
    
    const res = await client.query('SELECT count(*) FROM reports');
    console.log("Count:", res.rows[0]);
  } catch(e) {
    console.error("Error executing query:", e.message);
  }
  await client.end();
}

run().catch(console.error);
