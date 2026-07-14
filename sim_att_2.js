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
  const empRes = await c.query("SELECT * FROM employees WHERE id = 'TEST01'");
  const repRes = await c.query("SELECT * FROM reports WHERE emp_id = 'TEST01'");
  
  global.DB = {
    employees: empRes.rows.map(r => ({id: r.id, name: r.name, role: r.role})),
    reports: repRes.rows.map(r => {
      let isFinal = false;
      try {
        if (r.remarks && r.remarks.includes('===METADATA===')) {
          const m = JSON.parse(r.remarks.split('===METADATA===\n')[1]);
          isFinal = m.isFinal === true;
        }
      } catch(e){}
      
      let dateStr = r.date;
      if (dateStr instanceof Date) {
        // use IST date string
        dateStr = (new Date(dateStr.getTime() + 5.5*3600000)).toISOString().substring(0, 10);
      } else if (typeof dateStr === 'string' && dateStr.includes('T')) {
        dateStr = (new Date(new Date(dateStr).getTime() + 5.5*3600000)).toISOString().substring(0, 10);
      }

      return {
        id: r.id, empId: r.emp_id, date: dateStr, isFinal: isFinal
      };
    }),
    attendance: [],
    holidays: [],
    weeklyOffConfig: []
  };

  const scriptTxt = fs.readFileSync('script_0.js', 'utf8');
  const evalFuncs = `
    function getTodayDateString() { return "2026-07-12"; }
    function isAttendanceTrackedEmployee(e) { return true; }
    function formatDateForPostgres(d) { return d; }
    function offsetDate(dateStr, offsetDays) {
      var parts = String(dateStr).split('-');
      var d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10) + offsetDays);
      var year = d.getFullYear();
      var month = String(d.getMonth() + 1).padStart(2, '0');
      var day = String(d.getDate()).padStart(2, '0');
      return year + '-' + month + '-' + day;
    }
    
    // OVERRIDE getAttendanceDashboardRows to add logging
    function getAttendanceDashboardRows() {
      var curDate = "2026-07-12";
      var emp = DB.employees[0];
      
      var finalDcrExists = (DB.reports || []).some(function(r) {
        var empMatch = String(r.empId || '').toUpperCase() === String(emp.id || '').toUpperCase();
        var dateMatch = (formatDateForPostgres(r.date) || r.date) === curDate;
        var finalMatch = r.isFinal === true;
        console.log("Report " + r.id + ": empMatch=" + empMatch + ", dateMatch=" + dateMatch + " (r.date=" + r.date + "), finalMatch=" + finalMatch);
        return empMatch && dateMatch && finalMatch;
      });
      console.log("finalDcrExists:", finalDcrExists);
      return [];
    }
  `;
  
  eval(evalFuncs);
  getAttendanceDashboardRows();
  c.end();
}
run().catch(e => { console.error(e); c.end(); });
