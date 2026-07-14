require('dotenv').config();
const { Client } = require('pg');
const client = new Client({connectionString: process.env.DATABASE_URL});
client.connect()
  .then(() => client.query("SELECT id, status, account_status, doj FROM employees WHERE id IN ('ADLA81', 'ADLA118', 'TEST01', 'ADLA128')"))
  .then(res => { console.log(JSON.stringify(res.rows, null, 2)); process.exit(0); })
  .catch(e => { console.error(e); process.exit(1); });
