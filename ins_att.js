require('dotenv').config();
const {Client} = require('pg');
const c = new Client(process.env.DATABASE_URL);
c.connect().then(() => c.query("INSERT INTO attendance (id, employee_id, date, attendance_status, remarks, created_at) VALUES ('ATT-TEST01-2026-07-12', 'TEST01', '2026-07-12', 'P', 'Present via Final DCR Submission', NOW()) ON CONFLICT (employee_id, date) DO UPDATE SET attendance_status = 'P', remarks = 'Present via Final DCR Submission'"))
.then(res => { console.log('Inserted successfully'); c.end(); })
.catch(e => { console.log(e.message); c.end(); });
