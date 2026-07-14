require('dotenv').config();
const {Client} = require('pg');
const c = new Client(process.env.DATABASE_URL);
c.connect().then(() => c.query("SELECT count(*) FROM employees WHERE account_status = 'BLOCKED'"))
.then(res => { console.log("Blocked count:", res.rows[0].count); c.end(); });
