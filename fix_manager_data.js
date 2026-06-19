const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const replacements = [
  {
    find: /function renderAdminStats\(\)\{[\s\S]*?document\.getElementById\('adm-pending-count'\)\.textContent=pendingTP\+pendingExp\+pendingLeave;\n\}/,
    replace: `function renderAdminStats(){
  var u=SESSION.user;
  var teamIds = u.role !== 'admin' ? getAllSubordinateIds(u.id) : null;
  var emps=DB.employees.filter(function(e){return (!teamIds || teamIds.includes(e.id)) && e.id !== 'ADMIN';});
  document.getElementById('adm-emp-count').textContent=emps.length;
  
  var docs=DB.doctors.filter(function(d){return !teamIds || teamIds.includes(d.assignTo);});
  document.getElementById('adm-doc-count').textContent=docs.length;
  
  var reps=DB.reports.filter(function(r){return !teamIds || teamIds.includes(r.empId);});
  document.getElementById('adm-rep-count').textContent=reps.length;
  
  var pendingTP=DB.tourPlans.filter(function(t){return isPendingForUser(t.status, t.managerId, u);}).length;
  var pendingExp=DB.expenses.filter(function(e){return isPendingForUser(e.status, e.managerId, u);}).length;
  var pendingLeave=DB.leaves.filter(function(l){return isPendingForUser(l.status, l.managerId, u);}).length;
  
  document.getElementById('adm-pending-count').textContent=pendingTP+pendingExp+pendingLeave;
}`
  },
  {
    find: /function renderAdminDashTeamList\(\)\{[\s\S]*?tbody\.innerHTML=team\.map\(function\(e\)\{[\s\S]*?\}\)\.join\(''\);\n\}/,
    replace: `function renderAdminDashTeamList(){
  var tbody=document.getElementById('adm-dash-team-body');
  var u=SESSION.user;
  var teamIds = u.role !== 'admin' ? getAllSubordinateIds(u.id) : null;
  var team=DB.employees.filter(function(e){return e.role==='emp' && (!teamIds || teamIds.includes(e.id));});
  
  tbody.innerHTML=team.map(function(e){
    var reportsCount=DB.reports.filter(function(r){return r.empId===e.id;}).length;
    var totalDocsAssigned=DB.doctors.filter(function(d){return d.assignTo===e.id && d.status==='Active';}).length;
    var visitedDocIds=[];
    DB.reports.filter(function(r){return r.empId===e.id;}).forEach(function(r){
      if(r.targetType==='Doctor' && !visitedDocIds.includes(r.docId)){
        visitedDocIds.push(r.docId);
      }
    });
    
    var cov = totalDocsAssigned ? Math.round((visitedDocIds.length / totalDocsAssigned)*100) : 0;
    var jfwCount=DB.reports.filter(function(r){return r.empId===e.id && r.jfwMgrId!=='';}).length;
    
    return '<tr><td>'+e.id+'</td><td class="tbl-name">'+e.name+'</td><td>'+e.area+'</td><td>'+reportsCount+'</td><td>'+cov+'%</td><td>'+jfwCount+'</td></tr>';
  }).join('');
}`
  },
  {
    find: /function populateAdminEmpFilters\(\)\{\n\s*var selectList=\['inv-issue-emp', 'inv-filter-emp', 'rep-filter-emp'\];[\s\S]*?\}\);\n\s*\}/,
    replace: `function populateAdminEmpFilters(){
    var selectList=['inv-issue-emp', 'inv-filter-emp', 'rep-filter-emp'];
    var u=SESSION.user;
    var teamIds = u.role !== 'admin' ? getAllSubordinateIds(u.id) : null;
    selectList.forEach(function(selId){
      var sel=document.getElementById(selId);
      if(sel){
        sel.innerHTML = selId==='rep-filter-emp'?'<option value="">All Employees</option>':'';
        DB.employees.filter(function(e){return e.role==='emp' && (!teamIds || teamIds.includes(e.id));}).forEach(function(e){
          var o=document.createElement('option');o.value=e.id;o.textContent=e.name+' ('+e.id+')';sel.appendChild(o);
        });
      }
    });
  }`
  }
];

let changed = false;
replacements.forEach((r, i) => {
  if (html.match(r.find)) {
    html = html.replace(r.find, r.replace);
    changed = true;
    console.log("Replaced", i);
  } else {
    console.log("Failed to match", i);
  }
});

// Also fix renderEmpTable filter
const empTableMatch = html.match(/var emps=DB\.employees\.filter\(function\(e\)\{\s*if \(\!e \|\| e\.id==='ADMIN'\) return false;/);
if (empTableMatch) {
  html = html.replace(empTableMatch[0], 
    "var teamIds = SESSION.user.role !== 'admin' ? getAllSubordinateIds(SESSION.user.id) : null;\n    var emps=DB.employees.filter(function(e){\n      if (!e || e.id==='ADMIN') return false;\n      if (teamIds && !teamIds.includes(e.id)) return false;");
  console.log("Replaced renderEmpTable");
} else {
  console.log("Failed to match renderEmpTable");
}

// Also fix renderLeaveBalanceTable filter
const leaveTableMatch = html.match(/var emps = DB\.employees\.filter\(function\(e\)\{\s*if \(\!e \|\| e\.id === 'ADMIN'\) return false;/);
if (leaveTableMatch) {
  html = html.replace(leaveTableMatch[0], 
    "var teamIds = SESSION.user.role !== 'admin' ? getAllSubordinateIds(SESSION.user.id) : null;\n    var emps = DB.employees.filter(function(e){\n      if (!e || e.id === 'ADMIN') return false;\n      if (teamIds && !teamIds.includes(e.id)) return false;");
  console.log("Replaced renderLeaveBalanceTable");
} else {
  console.log("Failed to match renderLeaveBalanceTable");
}

fs.writeFileSync('index.html', html, 'utf8');
