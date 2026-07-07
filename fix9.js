const fs = require('fs');
let c = fs.readFileSync('index.html', 'utf8');

// 1. Add onchange attribute to r-jfw-manager in HTML
const jfwSelectTarget = '<select id="r-jfw-manager"><option value="">-- Working Alone --</option></select>';
const jfwSelectReplacement = '<select id="r-jfw-manager" onchange="populateReportingDropdowns()"><option value="">-- Working Alone --</option></select>';
if (c.indexOf(jfwSelectReplacement) === -1) {
  c = c.replace(jfwSelectTarget, jfwSelectReplacement);
}

// 2. Modify populateReportingDropdowns logic to respect jfwVal
const popTargetStart = `function populateReportingDropdowns(){
  var teamIds = SESSION.user.role !== 'admin' ? getAllSubordinateIds(SESSION.user.id) : null;
  if (teamIds) {
    teamIds.push(SESSION.user.id);
  }`;
const popReplacement = `function populateReportingDropdowns(){
  var teamIds = SESSION.user.role !== 'admin' ? getAllSubordinateIds(SESSION.user.id) : null;
  if (teamIds) {
    teamIds.push(SESSION.user.id);
  }
  
  var jfwMgrEl = document.getElementById('r-jfw-manager');
  if (jfwMgrEl && jfwMgrEl.value) {
    teamIds = [jfwMgrEl.value];
  }`;
if (c.indexOf(popReplacement) === -1) {
  c = c.replace(popTargetStart, popReplacement);
}

fs.writeFileSync('index.html', c);
console.log('Done!');
