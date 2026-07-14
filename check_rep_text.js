require('dotenv').config();
const {Client} = require('pg');
const c = new Client(process.env.DATABASE_URL);
c.connect().then(() => c.query("SELECT id, date::text FROM reports WHERE emp_id = 'TEST01'"))
.then(res => { console.log(res.rows); c.end(); });
