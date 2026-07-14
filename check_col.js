require('dotenv').config();
const {Client} = require('pg');
const c = new Client(process.env.DATABASE_URL);
c.connect().then(() => c.query("SELECT data_type FROM information_schema.columns WHERE table_name = 'reports' AND column_name = 'date'"))
.then(res => { console.log(res.rows); c.end(); });
