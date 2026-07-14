require('dotenv').config();
const {Client} = require('pg');
const c = new Client(process.env.DATABASE_URL);
c.connect().then(() => c.query("SELECT id, emp_id, date, is_final FROM reports WHERE emp_id ILIKE 'test%'"))
.then(res => { console.log("Reports for test:", res.rows); c.end(); });
