const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://postgres.mmxdvruucggeixjqwsqr:Adonisgroma%402026@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres' });
client.connect().then(async () => {
  await client.query("SET request.headers = '{\"x-employee-id\": \"ADLA02\", \"x-employee-password\": \"ADLA02\"}'");
  const res = await client.query("SELECT * FROM employees");
  console.log('Employees fetched as ADLA02:', res.rows.length);
  await client.end();
}).catch(console.error);
