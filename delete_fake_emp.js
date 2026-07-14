require('dotenv').config();
const {Client} = require('pg');
const c = new Client(process.env.DATABASE_URL);
c.connect().then(() => c.query("DELETE FROM employees WHERE id = 'TEST_EMP_01'"))
.then(res => { console.log("Deleted fake employee"); c.end(); });
