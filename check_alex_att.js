const pg = require('pg');
require('dotenv').config();

const client = new pg.Client({
  connectionString: process.env.DATABASE_URL
});

client.connect()
  .then(() => client.query("SELECT * FROM attendance WHERE employee_id IN (SELECT id FROM employees WHERE name ILIKE '%Alex%') ORDER BY date DESC LIMIT 5"))
  .then(res => {
    console.log(res.rows);
    return client.end();
  })
  .catch(console.error);
