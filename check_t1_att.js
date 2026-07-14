require('dotenv').config();
const {Client} = require('pg');
const c = new Client(process.env.DATABASE_URL);
c.connect().then(() => c.query("SELECT * FROM attendance WHERE employee_id = 'TEST01' AND date >= '2026-07-11'"))
.then(res => { console.log(res.rows); c.end(); });
