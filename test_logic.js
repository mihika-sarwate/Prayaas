const fs = require('fs');

// We need to simulate the DB and SESSION to see what happens.
// Let's read index.html to see what it does, or better, we can't easily get the live DB.
// Let's create a mock DB.
let DB = {
  employees: [
    { id: 'CEO', name: 'PANKAJ UNDWAR', role: 'ceo', managerId: '', status: 'Active' },
    { id: 'VP', name: 'MILIND SARWATE', role: 'vp', managerId: 'CEO', status: 'Active' },
    { id: 'RSM', name: 'PRIYA RANJAN DAS', role: 'rsm', managerId: 'VP', status: 'Active' },
    { id: 'ASM', name: 'ASM USER', role: 'asm', managerId: 'RSM', status: 'Active' },
    { id: 'BE1', name: 'BE ONE', role: 'emp', managerId: 'ASM', status: 'Active' },
    { id: 'BE2', name: 'BE TWO', role: 'emp', managerId: 'ASM', status: 'Active' },
  ]
};

let SESSION = {
  user: DB.employees[3] // ASM
};

function getAllSubordinateIds(managerId) {
  let subIds = new Set();
  let toCheck = [String(managerId || '').trim().toUpperCase()];
  while (toCheck.length > 0) {
    let currentId = toCheck.pop();
    subIds.add(currentId);
    DB.employees.forEach(emp => {
      if (!emp || !emp.id) return;
      var empIdUpper = String(emp.id).trim().toUpperCase();
      var mId = String(emp.managerId || '').trim().toUpperCase();
      if (mId === currentId && !subIds.has(empIdUpper)) {
        toCheck.push(empIdUpper);
      }
    });
  }
  return Array.from(subIds);
}

var myManagerChainIds = [];
var current = SESSION.user;
var maxDepth = 20;
while (current && current.managerId && maxDepth > 0) {
  var mId = String(current.managerId).trim().toUpperCase();
  myManagerChainIds.push(mId);
  current = DB.employees.find(function(x) { return x && x.id && String(x.id).trim().toUpperCase() === mId; });
  maxDepth--;
}

var subs = getAllSubordinateIds(SESSION.user.id) || [];

var chain = DB.employees.filter(function(e) {
  if (!e) return false;
  if (e.id === SESSION.user.id) return false;
  if (e.status !== 'Active') return false;
  if ((e.role || '').toLowerCase() === 'admin') return false; // Explicitly hide admin
  
  var eIdUpper = String(e.id).trim().toUpperCase();
  return myManagerChainIds.includes(eIdUpper) || subs.includes(eIdUpper);
});

console.log("Logged in as:", SESSION.user.id);
console.log("Manager Chain:", myManagerChainIds);
console.log("Subordinates:", subs);
console.log("Final Dropdown Chain:", chain.map(e => e.id));
