const {Client} = require('pg'); require('dotenv').config();
const c=new Client({connectionString:process.env.DATABASE_URL}); 
c.connect().then(()=>c.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'reports'"))
.then(r=>console.log(r.rows)).finally(()=>c.end());
