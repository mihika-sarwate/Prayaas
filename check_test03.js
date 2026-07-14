require('dotenv').config();
const {Client} = require('pg');
const c = new Client(process.env.DATABASE_URL);
c.connect().then(async () => {
  const reports = await c.query("SELECT * FROM reports WHERE emp_id = 'TEST03'");
  console.log("Reports for TEST03:", reports.rows);
  const att = await c.query("SELECT * FROM attendance WHERE employee_id = 'TEST03'");
  console.log("Attendance for TEST03:", att.rows);
  c.end();
}).catch(e => { console.log(e.message); c.end(); });
