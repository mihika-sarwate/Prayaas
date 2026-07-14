require('dotenv').config();
const {Client} = require('pg');
const c = new Client(process.env.DATABASE_URL);
c.connect().then(() => c.query("SELECT id, name FROM employees WHERE id ILIKE 'test%'"))
.then(res => { console.log("Test employees:", res.rows); c.end(); });
