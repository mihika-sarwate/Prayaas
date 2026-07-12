const {Client} = require('pg'); require('dotenv').config();
const c=new Client({connectionString:process.env.DATABASE_URL}); 
c.connect().then(()=>c.query("SELECT * FROM reports ORDER BY created_at DESC LIMIT 5"))
.then(r=>console.log(r.rows)).finally(()=>c.end());
