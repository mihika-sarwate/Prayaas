const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

// 1. Fix renderAdminDocList
code = code.replace(
  /var docs=DB\.doctors\.filter\(function\(d\)\{return !q\|\|d\.name\.toLowerCase\(\)\.includes\(q\)\|\|d\.spec\.toLowerCase\(\)\.includes\(q\)\|\|d\.area\.toLowerCase\(\)\.includes\(q\)\|\|\(d\.assignTo\|\|''\)\.toLowerCase\(\)\.includes\(q\);\}/g,
  `var docs=DB.doctors.filter(function(d){return !q||(d.name||"").toLowerCase().includes(q)||(d.spec||"").toLowerCase().includes(q)||(d.area||"").toLowerCase().includes(q)||(d.assignTo||"").toLowerCase().includes(q);}`
);

// 2. Fix renderAdminChemistList
code = code.replace(
  /var chems=DB\.chemists\.filter\(function\(c\)\{return !q\|\|c\.name\.toLowerCase\(\)\.includes\(q\)\|\|c\.area\.toLowerCase\(\)\.includes\(q\)\|\|\(c\.assignTo\|\|''\)\.toLowerCase\(\)\.includes\(q\);\}/g,
  `var chems=DB.chemists.filter(function(c){return !q||(c.name||"").toLowerCase().includes(q)||(c.area||"").toLowerCase().includes(q)||(c.assignTo||"").toLowerCase().includes(q);}`
);

// 3. Fix Manager Panel title
code = code.replace(
  /document\.getElementById\('adm-panel-title'\)\.textContent = SESSION\.user\.role === 'admin' \? 'Admin Panel' : 'Manager Panel';/g,
  `document.getElementById('adm-panel-title').textContent = (SESSION.user.role === 'admin' ? 'Admin Panel' : 'Manager Panel') + ' - ' + SESSION.user.name;`
);
code = code.replace(
  /document\.getElementById\('adm-panel-title'\)\.textContent=emp\.role==='admin'\?'Admin Panel':'Manager Panel';/g,
  `document.getElementById('adm-panel-title').textContent=(emp.role==='admin'?'Admin Panel':'Manager Panel') + ' - ' + emp.name;`
);

// 4. Fix approvals case sensitivity (AdminTPApprovals)
code = code.replace(
  /return u\.role==='admin' \|\| t\.managerId===u\.id;/g,
  `return u.role==='admin' || (t.managerId||"").toLowerCase()===(u.id||"").toLowerCase();`
);
code = code.replace(
  /return t\.managerId===u\.id;/g,
  `return (t.managerId||"").toLowerCase()===(u.id||"").toLowerCase();`
);

// ExpApprovals
code = code.replace(
  /return u\.role==='admin' \|\| e\.managerId===u\.id;/g,
  `return u.role==='admin' || (e.managerId||"").toLowerCase()===(u.id||"").toLowerCase();`
);
code = code.replace(
  /return e\.managerId===u\.id;/g,
  `return (e.managerId||"").toLowerCase()===(u.id||"").toLowerCase();`
);

// LeaveApprovals
code = code.replace(
  /return u\.role==='admin' \|\| l\.managerId===u\.id;/g,
  `return u.role==='admin' || (l.managerId||"").toLowerCase()===(u.id||"").toLowerCase();`
);
code = code.replace(
  /return l\.managerId===u\.id;/g,
  `return (l.managerId||"").toLowerCase()===(u.id||"").toLowerCase();`
);

// approveTP
code = code.replace(
  /if \(u\.role === 'admin' && tp\.managerId === u\.id\) \{/g,
  `if (u.role === 'admin' && (tp.managerId||"").toLowerCase() === (u.id||"").toLowerCase()) {`
);
code = code.replace(
  /\} else if \(tp\.managerId === u\.id\) \{/g,
  `} else if ((tp.managerId||"").toLowerCase() === (u.id||"").toLowerCase()) {`
);
code = code.replace(
  /canApprove = \(u\.role === 'admin' \|\| tp\.managerId === u\.id\);/g,
  `canApprove = (u.role === 'admin' || (tp.managerId||"").toLowerCase() === (u.id||"").toLowerCase());`
);
code = code.replace(
  /canApprove = \(tp\.managerId === u\.id\);/g,
  `canApprove = ((tp.managerId||"").toLowerCase() === (u.id||"").toLowerCase());`
);

// approveExp
code = code.replace(
  /if \(u\.role === 'admin' && ex\.managerId === u\.id\) \{/g,
  `if (u.role === 'admin' && (ex.managerId||"").toLowerCase() === (u.id||"").toLowerCase()) {`
);
code = code.replace(
  /\} else if \(ex\.managerId === u\.id\) \{/g,
  `} else if ((ex.managerId||"").toLowerCase() === (u.id||"").toLowerCase()) {`
);
code = code.replace(
  /canApprove = \(u\.role === 'admin' \|\| ex\.managerId === u\.id\);/g,
  `canApprove = (u.role === 'admin' || (ex.managerId||"").toLowerCase() === (u.id||"").toLowerCase());`
);
code = code.replace(
  /canApprove = \(ex\.managerId === u\.id\);/g,
  `canApprove = ((ex.managerId||"").toLowerCase() === (u.id||"").toLowerCase());`
);

// approveLeave
code = code.replace(
  /if \(u\.role === 'admin' && lv\.managerId === u\.id\) \{/g,
  `if (u.role === 'admin' && (lv.managerId||"").toLowerCase() === (u.id||"").toLowerCase()) {`
);
code = code.replace(
  /\} else if \(lv\.managerId === u\.id\) \{/g,
  `} else if ((lv.managerId||"").toLowerCase() === (u.id||"").toLowerCase()) {`
);
code = code.replace(
  /canApprove = \(u\.role === 'admin' \|\| lv\.managerId === u\.id\);/g,
  `canApprove = (u.role === 'admin' || (lv.managerId||"").toLowerCase() === (u.id||"").toLowerCase());`
);
code = code.replace(
  /canApprove = \(lv\.managerId === u\.id\);/g,
  `canApprove = ((lv.managerId||"").toLowerCase() === (u.id||"").toLowerCase());`
);

// 5. Update Download Template buttons to say Download Data
code = code.replace(
  /<button class="btn sm success" onclick="downloadEmpTemplate\(\)">&#8595; Emp Template<\/button>/g,
  `<button class="btn sm success" onclick="downloadEmpTemplate()">&#8595; Download Selected/All</button>`
);
code = code.replace(
  /<button class="btn sm success" onclick="downloadDocTemplate\(\)">&#8595; Doc Template<\/button>/g,
  `<button class="btn sm success" onclick="downloadDocTemplate()">&#8595; Download Selected/All</button>`
);
code = code.replace(
  /<button class="btn sm success" onclick="downloadChemTemplate\(\)">&#8595; Chemist Template<\/button>/g,
  `<button class="btn sm success" onclick="downloadChemTemplate()">&#8595; Download Selected/All</button>`
);

// 6. Remove columns from Tour Plan MTP Days UI
code = code.replace(
  /<div class="tbl-wrap"><table class="tbl" style="min-width:620px"><thead><tr><th>Date<\/th><th>Day<\/th><th>Area \/ Territory<\/th><th>Town \/ City<\/th><th>Planned Doctors<\/th><th>Planned Chemists<\/th><\/tr><\/thead><tbody>/g,
  `<div class="tbl-wrap"><table class="tbl" style="min-width:620px"><thead><tr><th>Date</th><th>Day</th><th>Area / Territory</th><th>Town / City</th></tr></thead><tbody>`
);
code = code.replace(
  /'<td><span class="badge blue">'\+docs\.length\+' Doctors<\/span><\/td>'\+/g,
  ''
);
code = code.replace(
  /'<td><span class="badge green">'\+chems\.length\+' Chemists<\/span><\/td>'\+/g,
  ''
);

// 7. Remove columns from viewTP
code = code.replace(
  /<div class="tbl-wrap"><table class="tbl" style="min-width:760px"><thead><tr><th>Date<\/th><th>Area \/ Territory<\/th><th>Planned Doctor Calls<\/th><th>Planned Chemist Calls<\/th><\/tr><\/thead><tbody>/g,
  `<div class="tbl-wrap"><table class="tbl" style="min-width:760px"><thead><tr><th>Date</th><th>Area / Territory</th></tr></thead><tbody>`
);
code = code.replace(
  /<td><span class="badge blue">'\+docIds\.length\+' Doctors<\/span><\/td><td><span class="badge green">'\+chemIds\.length\+' Chemists<\/span><\/td>/g,
  ''
);

fs.writeFileSync('index.html', code);
console.log('Script completed successfully.');
