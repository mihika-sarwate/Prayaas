const {Client} = require('pg'); require('dotenv').config();
const c=new Client({connectionString:process.env.DATABASE_URL}); 
c.connect().then(()=>c.query("UPDATE employees SET account_status = 'ACTIVE' WHERE account_status = 'BLOCKED'"))
.then(r=>console.log("Unblocked", r.rowCount, "employees")).finally(()=>c.end());
