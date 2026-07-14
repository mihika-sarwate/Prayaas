require('dotenv').config();
const {Client} = require('pg');
const c = new Client(process.env.DATABASE_URL);
c.connect().then(() => c.query("SELECT * FROM stockists LIMIT 1"))
.then(res => { console.log('Success'); c.end(); })
.catch(e => { console.log(e.message); c.end(); });
