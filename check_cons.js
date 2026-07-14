require('dotenv').config();
const {Client} = require('pg');
const c = new Client(process.env.DATABASE_URL);
c.connect().then(() => c.query("SELECT constraint_name, table_name FROM information_schema.table_constraints WHERE table_name = 'attendance' AND constraint_type = 'UNIQUE'"))
.then(res => { console.log(res.rows); c.end(); })
.catch(e => { console.log(e.message); c.end(); });
