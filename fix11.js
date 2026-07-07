const fs = require('fs');
let c = fs.readFileSync('index.html', 'utf8');

const injection = `
  var teamIds = SESSION.user.role !== 'admin' ? getAllSubordinateIds(SESSION.user.id) : null;
  if (teamIds) {
    teamIds.push(SESSION.user.id);
  }
  var jfwMgrEl = document.getElementById('r-jfw-manager');
  if (jfwMgrEl && jfwMgrEl.value) {
    teamIds = [jfwMgrEl.value];
  }`;

// 1. Manually replace in populateReportingDropdowns
let target1 = `function populateReportingDropdowns(){
  var teamIds = SESSION.user.role !== 'admin' ? getAllSubordinateIds(SESSION.user.id) : null;
  if (teamIds) {
    teamIds.push(SESSION.user.id);
  }`;
let target1_crlf = target1.replace(/\n/g, '\r\n');

if (c.includes(target1_crlf)) {
  c = c.replace(target1_crlf, `function populateReportingDropdowns(){${injection}`);
} else if (c.includes(target1)) {
  c = c.replace(target1, `function populateReportingDropdowns(){${injection}`);
} else {
  console.log("Could not find populateReportingDropdowns target");
}

// 2. Manually replace in populateReportTerritoryDropdowns
let target2 = `function populateReportTerritoryDropdowns() {
  if (!SESSION.user) return;
  var teamIds = SESSION.user.role !== 'admin' ? getAllSubordinateIds(SESSION.user.id) : null;
  if (teamIds) {
    teamIds.push(SESSION.user.id);
  }`;
let target2_crlf = target2.replace(/\n/g, '\r\n');

if (c.includes(target2_crlf)) {
  c = c.replace(target2_crlf, `function populateReportTerritoryDropdowns() {\r\n  if (!SESSION.user) return;\r\n${injection}`);
} else if (c.includes(target2)) {
  c = c.replace(target2, `function populateReportTerritoryDropdowns() {\n  if (!SESSION.user) return;\n${injection}`);
} else {
  console.log("Could not find populateReportTerritoryDropdowns target");
}

// 3. Update onchange in HTML to call both (if not already there from git history)
let oldOnchange = '<select id="r-jfw-manager" onchange="populateReportingDropdowns()">';
let newOnchange = '<select id="r-jfw-manager" onchange="populateReportingDropdowns(); populateReportTerritoryDropdowns(); filterReportingDropdownsByPatch();">';
if (c.includes(oldOnchange)) {
  c = c.replace(oldOnchange, newOnchange);
}

fs.writeFileSync('index.html', c);
console.log('Fix 11 applied!');
