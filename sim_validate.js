const fs = require('fs');
let code = fs.readFileSync('script_0.js', 'utf8');

// Mock DOM
global.document = {
  getElementById: () => null,
  querySelectorAll: () => []
};
global.window = {};
global.localStorage = {
  getItem: () => null,
  setItem: () => {}
};
global.navigator = { onLine: true };
global.console = { log: console.log, warn: console.warn, error: console.error };

// Remove references to window, document where it crashes
code = code.replace(/window\.addEventListener/g, '//');
code = code.replace(/document\.addEventListener/g, '//');
code = code.replace(/if \(!DB \|\| !Array\.isArray\(DB\.employees\)\) return;/g, '');

// Run script_0.js
eval(code);

// Mock DB
global.DB = {
  employees: [
    { id: 'ADLA128', name: 'Abhijit Saha', role: 'MR', status: 'Active', accountStatus: 'ACTIVE', doj: '2020-01-01', state: 'WB' },
    { id: 'ADLA81', name: 'Abhiram Kumar', role: 'Manager', status: 'Active', accountStatus: 'ACTIVE', doj: '2020-01-01', state: 'WB' },
    { id: 'TEST01', name: 'Alex', role: 'MR', status: 'Active', accountStatus: 'ACTIVE', doj: '2026-07-11', state: 'WB' }
  ],
  attendance: [],
  reports: [],
  holidays: [],
  leaves: [],
  weeklyOffConfig: []
};

// Simulate
console.log("Validating 2026-07-13");
validateAttendanceForDate('2026-07-13');

console.log("DB.employees after validation:");
console.log(global.DB.employees.map(e => ({ id: e.id, accountStatus: e.accountStatus })));
console.log("DB.attendance after validation:");
console.log(global.DB.attendance);
