require('dotenv').config();
const {Client} = require('pg');
const c = new Client(process.env.DATABASE_URL);
c.connect().then(() => c.query("SELECT * FROM employees WHERE id = 'TEST02'"))
.then(res => { console.log(res.rows); c.end(); })
.catch(e => { console.log(e.message); c.end(); });
