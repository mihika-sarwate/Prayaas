const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

html = html.replace(
  /function runMISReport\(\)\{[\s\S]*?\/\/ Filter base calls reports\s*var baseReports=DB\.reports\.filter\(function\(r\)\{/,
  `function runMISReport(){
    var empId=document.getElementById('rep-filter-emp').value;
    var from=document.getElementById('rep-from').value;
    var to=document.getElementById('rep-to').value;
    
    var thead=document.getElementById('mis-report-thead');
    var tbody=document.getElementById('mis-report-tbody');
    var u=SESSION.user;
    var teamIds = u.role !== 'admin' ? getAllSubordinateIds(u.id) : null;
    
    // Filter base calls reports
    var baseReports=DB.reports.filter(function(r){
      if(teamIds && !teamIds.includes(r.empId)) return false;`
);

html = html.replace(
  /function renderAdminInventoryTables\(\)\{\s*var mrFilter=document\.getElementById\('inv-filter-emp'\)\.value;[\s\S]*?\/\/ Render Samples\s*var samplesList = DB\.samplesInventory\.filter\(function\(s\)\{return \!mrFilter\|\|s\.empId===mrFilter;\}\);[\s\S]*?\/\/ Render Gifts\s*var giftsList = DB\.giftsInventory\.filter\(function\(g\)\{return \!mrFilter\|\|g\.empId===mrFilter;\}\);/g,
  `function renderAdminInventoryTables(){
    var mrFilter=document.getElementById('inv-filter-emp').value;
    var u=SESSION.user;
    var teamIds = u.role !== 'admin' ? getAllSubordinateIds(u.id) : null;
    
    // Render Samples
    var samplesList = DB.samplesInventory.filter(function(s){return (!mrFilter||s.empId===mrFilter) && (!teamIds || teamIds.includes(s.empId));});
    document.getElementById('tbl-inv-samples').innerHTML=samplesList.length?samplesList.map(function(s){
      var emp=DB.employees.find(function(e){return e.id===s.empId;});
      return '<tr><td>'+(emp?emp.name:'')+' ('+s.empId+')</td><td>'+s.prodName+'</td><td>'+s.opening+'</td><td>'+s.received+'</td><td>'+s.distributed+'</td><td style="font-weight:700">'+s.balance+'</td></tr>';
    }).join(''):'<tr><td colspan="6" class="empty">No entries found</td></tr>';
  
    // Render Gifts
    var giftsList = DB.giftsInventory.filter(function(g){return (!mrFilter||g.empId===mrFilter) && (!teamIds || teamIds.includes(g.empId));});`
);

fs.writeFileSync('index.html', html, 'utf8');
console.log("Done");
