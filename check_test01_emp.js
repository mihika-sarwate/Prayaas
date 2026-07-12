const {Client} = require('pg'); require('dotenv').config();
const c=new Client({connectionString:process.env.DATABASE_URL}); 
c.connect().then(()=>c.query("SELECT id, name, account_status FROM employees WHERE id ILIKE 'test01'"))
.then(r=>console.log(r.rows)).finally(()=>c.end());
