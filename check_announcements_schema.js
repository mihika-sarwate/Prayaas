require('dotenv').config();
const {Client} = require('pg');
const c = new Client(process.env.DATABASE_URL);
c.connect().then(() => c.query(`
  SELECT column_name, data_type 
  FROM information_schema.columns 
  WHERE table_name = 'announcements';
`))
.then(res => { console.table(res.rows); c.end(); })
.catch(err => { console.error(err); c.end(); });
