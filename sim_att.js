const fs = require('fs');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const dom = new JSDOM(`<body>
  <input id="attendance-employee-filter" value="TEST01" />
  <input id="attendance-status-filter" value="" />
  <input id="attendance-search" value="" />
</body>`, { runScripts: "dangerously" });

const window = dom.window;
const document = window.document;
global.document = document;
global.window = window;

require('dotenv').config();
const {Client} = require('pg');
const c = new Client(process.env.DATABASE_URL);

async function run() {
  await c.connect();
  const empRes = await c.query("SELECT * FROM employees");
  const repRes = await c.query("SELECT * FROM reports");
  const attRes = await c.query("SELECT * FROM attendance");
  const holRes = await c.query("SELECT * FROM holidays");
  const woRes = await c.query("SELECT * FROM weekly_off_config");
  
  // mock DB
  global.DB = {
    employees: empRes.rows.map(r => ({id: r.id, name: r.name, role: r.role, status: r.status, accountStatus: r.account_status})),
    reports: repRes.rows.map(r => {
      let isFinal = false;
      try {
        if (r.remarks && r.remarks.includes('===METADATA===')) {
          const m = JSON.parse(r.remarks.split('===METADATA===\n')[1]);
          isFinal = m.isFinal === true;
        }
      } catch(e){}
      
      let dateStr = r.date; // assuming string like YYYY-MM-DD
      if (dateStr instanceof Date) {
        dateStr = dateStr.toISOString().substring(0, 10);
      }

      return {
        id: r.id, empId: r.emp_id, date: dateStr, isFinal: isFinal
      };
    }),
    attendance: attRes.rows.map(r => ({employeeId: r.employee_id, date: (r.date instanceof Date ? r.date.toISOString().substring(0, 10) : r.date), attendanceStatus: r.attendance_status})),
    holidays: [],
    weeklyOffConfig: []
  };

  const scriptTxt = fs.readFileSync('script_0.js', 'utf8');
  const evalFuncs = `
    function getTodayDateString() { return "2026-07-12"; }
    function isAttendanceTrackedEmployee(e) { return true; }
    function formatDateForPostgres(d) { return d; }
  `;
  
  const getRowsCode = scriptTxt.substring(scriptTxt.indexOf('function getAttendanceDashboardRows()'));
  const endIndex = getRowsCode.indexOf('function renderAttendanceDashboard()');
  const finalCode = evalFuncs + getRowsCode.substring(0, endIndex);
  
  eval(finalCode);
  
  const rows = getAttendanceDashboardRows();
  console.log("Virtual Rows for TEST01:");
  rows.forEach(r => console.log(r.date, r.attendanceStatus));
  c.end();
}
run().catch(e => { console.error(e); c.end(); });
