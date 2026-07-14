require('dotenv').config();
const {Client} = require('pg');
const c = new Client(process.env.DATABASE_URL);
c.connect().then(() => c.query("SELECT id, date, is_final FROM reports WHERE emp_id = 'TEST01' AND date LIKE '2026-07-12%'"))
.then(res => { console.log(res.rows); c.end(); });
