const { Client } = require('pg');

const client = new Client({
  connectionString: "postgresql://postgres.mmxdvruucggeixjqwsqr:Adonisgroma%402026@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres"
});

async function run() {
  await client.connect();
  try {
    await client.query("SET ROLE authenticated");
    await client.query("SET request.jwt.claim.emp_id = 'ADLA100'");
    await client.query("SET request.jwt.claim.emp_pwd = 'pass123'"); // use valid password just in case? Actually ADLA100 password is in db, let's query it.
    
    const pwdRes = await client.query("SELECT pwd FROM employees WHERE id = 'ADLA100'");
    const actualPwd = pwdRes.rows[0].pwd;
    await client.query("SET request.jwt.claim.emp_pwd = '" + actualPwd + "'");
    
    // simulate authenticated user
    const res = await client.query('SELECT * FROM reports LIMIT 1000 OFFSET 0');
    console.log("Returned rows:", res.rows.length);
  } catch(e) {
    console.error("Error executing query:", e.message);
  }
  await client.end();
}

run().catch(console.error);
