const fs = require('fs');
let c = fs.readFileSync('index.html', 'utf8');

function updateFunction(funcName) {
  // Find "function funcName() {"
  let rx = new RegExp('function ' + funcName + '\\s*\\([^)]*\\)\\s*\\{([\\s\\S]*?)(var|let|const)\\s');
  let match = c.match(rx);
  if (match) {
    let injection = `
  var teamIds = SESSION.user.role !== 'admin' ? getAllSubordinateIds(SESSION.user.id) : null;
  if (teamIds) {
    teamIds.push(SESSION.user.id);
  }
  var jfwMgrEl = document.getElementById('r-jfw-manager');
  if (jfwMgrEl && jfwMgrEl.value) {
    teamIds = [jfwMgrEl.value];
  }
`;
    // We will replace the original teamIds logic.
    let oldLogicRegex = /var teamIds = SESSION\.user\.role !== 'admin' \? getAllSubordinateIds\(SESSION\.user\.id\) : null;[\s\S]*?if \(teamIds\) \{[\s\S]*?teamIds\.push\(SESSION\.user\.id\);[\s\S]*?\}/;
    c = c.replace(oldLogicRegex, injection.trim());
  }
}

// 1. Update populateReportingDropdowns
updateFunction('populateReportingDropdowns');

// 2. Update populateReportTerritoryDropdowns
updateFunction('populateReportTerritoryDropdowns');

// 3. Update onchange in HTML to call both
let oldOnchange = '<select id="r-jfw-manager" onchange="populateReportingDropdowns()">';
let newOnchange = '<select id="r-jfw-manager" onchange="populateReportingDropdowns(); populateReportTerritoryDropdowns(); filterReportingDropdownsByPatch();">';
if (c.indexOf(oldOnchange) !== -1) {
  c = c.replace(oldOnchange, newOnchange);
}

fs.writeFileSync('index.html', c);
console.log('Fix 10 applied!');
