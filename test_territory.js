const fs = require('fs');

let SESSION = { user: { id: 'ASM01', role: 'manager' } };

let DB = {
  employees: [
    { id: 'ASM01', managerId: 'RSM01' },
    { id: 'MR01', managerId: 'ASM01' }
  ],
  doctors: [
    { id: 'D1', assignTo: 'MR01', status: 'Active', territoryType: 'HQ', city: 'Mumbai', area: 'Andheri' }
  ],
  chemists: []
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

var teamIds = SESSION.user.role !== 'admin' ? getAllSubordinateIds(SESSION.user.id) : null;
if (teamIds) {
  teamIds.push(SESSION.user.id);
}

console.log("teamIds:", teamIds);

var mrTownsByTerritory = { 'HQ': new Set(), 'EX': new Set(), 'OS': new Set() };
var mrAreasByTerritory = { 'HQ': new Set(), 'EX': new Set(), 'OS': new Set() };

DB.doctors.forEach(function(d) {
  var assignedList = String(d.assignTo || '').toUpperCase().split(',').map(function(s){return s.trim();});
  var isAssignedToTeam = teamIds ? assignedList.some(function(a){ return teamIds.includes(a); }) : true;
  
  if (isAssignedToTeam && d.status === 'Active') {
    var tType = (d.territoryType || '').trim().toUpperCase();
    if (tType) {
      if (!mrTownsByTerritory[tType]) mrTownsByTerritory[tType] = new Set();
      if (d.city) mrTownsByTerritory[tType].add(d.city.trim());
      if (!mrAreasByTerritory[tType]) mrAreasByTerritory[tType] = new Set();
      if (d.area) mrAreasByTerritory[tType].add(d.area.trim());
    }
  }
});

console.log("Towns HQ:", Array.from(mrTownsByTerritory['HQ']));
console.log("Areas HQ:", Array.from(mrAreasByTerritory['HQ']));
