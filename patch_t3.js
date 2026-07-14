require('dotenv').config();
const {Client} = require('pg');
const c = new Client(process.env.DATABASE_URL);
c.connect().then(async () => {
  const dbAtt = {
    id: 'ATT-TEST03-2026-07-12',
    employee_id: 'TEST03',
    date: '2026-07-12',
    login_time: null,
    attendance_status: 'P',
    remarks: 'Present via Final DCR Submission (Patch)',
    created_at: new Date().toISOString()
  };
  
  await c.query(`
    INSERT INTO attendance (id, employee_id, date, login_time, attendance_status, remarks, created_at)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    ON CONFLICT (employee_id, date) DO UPDATE SET
      attendance_status = EXCLUDED.attendance_status,
      remarks = EXCLUDED.remarks,
      created_at = EXCLUDED.created_at
  `, [dbAtt.id, dbAtt.employee_id, dbAtt.date, dbAtt.login_time, dbAtt.attendance_status, dbAtt.remarks, dbAtt.created_at]);
  
  console.log("Patched test03 attendance.");
  c.end();
}).catch(e => { console.log(e.message); c.end(); });
