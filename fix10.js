const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

html = html.replace(
  /var emps=DB\.employees\.filter\(function\(e\)\{return resolveManagerId\(e\.managerId\)===u\.id \|\| u\.role==='admin';\}\);[\s\S]*?document\.getElementById\('adm-pending-count'\)\.textContent=pendingTP\+pendingExp\+pendingLeave;/,
  `var teamIds = u.role !== 'admin' ? getAllSubordinateIds(u.id) : null;
  var emps=DB.employees.filter(function(e){return (!teamIds || teamIds.includes(e.id)) && e.id !== 'ADMIN';});
  document.getElementById('adm-emp-count').textContent=emps.length;
  var docs=DB.doctors.filter(function(d){return !teamIds || teamIds.includes(d.assignTo);});
  document.getElementById('adm-doc-count').textContent=docs.length;
  var reps=DB.reports.filter(function(r){return !teamIds || teamIds.includes(r.empId);});
  document.getElementById('adm-rep-count').textContent=reps.length;
  
  var pendingTP=DB.tourPlans.filter(function(t){return isPendingForUser(t.status, t.managerId, u);}).length;
  var pendingExp=DB.expenses.filter(function(e){return isPendingForUser(e.status, e.managerId, u);}).length;
  var pendingLeave=DB.leaves.filter(function(l){return isPendingForUser(l.status, l.managerId, u);}).length;
  
  document.getElementById('adm-pending-count').textContent=pendingTP+pendingExp+pendingLeave;`
);

html = html.replace(
  /var team=DB\.employees\.filter\(function\(e\)\{return e\.role==='emp';\}\);/,
  `var u=SESSION.user;
  var teamIds = u.role !== 'admin' ? getAllSubordinateIds(u.id) : null;
  var team=DB.employees.filter(function(e){return e.role==='emp' && (!teamIds || teamIds.includes(e.id));});`
);

html = html.replace(
  /sel\.innerHTML = selId==='rep-filter-emp'\?'<option value="">All Employees<\/option>':'';\s*DB\.employees\.filter\(function\(e\)\{return e\.role==='emp';\}\)/,
  `sel.innerHTML = selId==='rep-filter-emp'?'<option value="">All Employees</option>':'';
        DB.employees.filter(function(e){return e.role==='emp' && (!teamIds || teamIds.includes(e.id));})`
);

// We need to add teamIds to populateAdminEmpFilters
html = html.replace(
  /function populateAdminEmpFilters\(\)\{\s*var selectList=\['inv-issue-emp', 'inv-filter-emp', 'rep-filter-emp'\];/,
  `function populateAdminEmpFilters(){
    var selectList=['inv-issue-emp', 'inv-filter-emp', 'rep-filter-emp'];
    var u=SESSION.user;
    var teamIds = u.role !== 'admin' ? getAllSubordinateIds(u.id) : null;`
);

// fix leave balance table
html = html.replace(
  /function renderLeaveBalanceTable\(\)\{[\s\S]*?var emps=DB\.employees\.filter\(function\(e\)\{\s*if \(\!e \|\| e\.id==='ADMIN'\) return false;/,
  `function renderLeaveBalanceTable(){
  var thead = document.getElementById('leave-bal-table-head');
  if(thead) {
    var monthYear = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
    thead.innerHTML = '<tr><th colspan="6" style="border:none"></th><th colspan="12" style="text-align:center;border:none">'+monthYear+'</th></tr>' +
      '<tr><th rowspan="2">S.No</th><th rowspan="2">Employee id</th><th rowspan="2">FieldForce Name</th><th rowspan="2">Designation</th><th rowspan="2">HQ</th><th rowspan="2">Joining Date</th><th colspan="4" style="text-align:center">Leave Eligibilty</th><th colspan="4" style="text-align:center">Leave Taken</th><th colspan="4" style="text-align:center">Leave Balance</th></tr>' +
      '<tr><th>CL</th><th>PL</th><th>SL</th><th>LOP</th><th>CL</th><th>PL</th><th>SL</th><th>LOP</th><th>CL</th><th>PL</th><th>SL</th><th>LOP</th></tr>';
  }
  var tbody=document.getElementById('leave-bal-table-body');
  if(!tbody) return;
  var q = getSearchQuery('adm-leave-search');
  var u = SESSION.user;
  var teamIds = u.role !== 'admin' ? getAllSubordinateIds(u.id) : null;
  var emps=DB.employees.filter(function(e){
    if (!e || e.id==='ADMIN') return false;
    if (teamIds && !teamIds.includes(e.id)) return false;`
);

fs.writeFileSync('index.html', html, 'utf8');
console.log("Done");
