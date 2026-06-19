const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// 1. Add CSS
if (!html.includes('.admin-only { display: none !important; }')) {
  html = html.replace('</style>', `body:not(.is-admin) .admin-only { display: none !important; }\n</style>`);
}

// 2. Add class toggle to initAdminApp
if (!html.includes("document.body.classList.toggle('is-admin'")) {
  html = html.replace(/function initAdminApp\(\)\{/, "function initAdminApp(){\n  document.body.classList.toggle('is-admin', SESSION.user.role === 'admin');");
}

// 3. Add admin-only class to HTML buttons
const replacements = [
  { f: /onclick="downloadSFCTemplate\(\)"/g, r: 'class="btn sm success admin-only" onclick="downloadSFCTemplate()"' },
  { f: /onclick="document.getElementById\('sfc-upload'\)\.click\(\)"/g, r: 'class="btn sm primary admin-only" onclick="document.getElementById(\'sfc-upload\').click()"' },
  { f: /onclick="bulkDeleteAllSFC\(\)"/g, r: 'class="btn sm danger admin-only" onclick="bulkDeleteAllSFC()"' },
  { f: /id="btn-bulk-delete-selected-sfc"/g, r: 'id="btn-bulk-delete-selected-sfc" class="btn sm danger admin-only"' },
  
  { f: /onclick="addEmployee\(\)"/g, r: 'class="btn primary sm admin-only" onclick="addEmployee()"' },
  { f: /onclick="document.getElementById\('emp-upload'\)\.click\(\)"/g, r: 'class="btn sm primary admin-only" onclick="document.getElementById(\'emp-upload\').click()"' },
  { f: /onclick="bulkDeleteAllEmployees\(\)"/g, r: 'class="btn sm danger admin-only" onclick="bulkDeleteAllEmployees()"' },
  { f: /id="btn-bulk-delete-selected-emps"/g, r: 'id="btn-bulk-delete-selected-emps" class="btn sm danger admin-only"' },
  
  { f: /onclick="document.getElementById\('doc-upload'\)\.click\(\)"/g, r: 'class="btn sm primary admin-only" onclick="document.getElementById(\'doc-upload\').click()"' },
  { f: /onclick="addDoctorManual\(\)"/g, r: 'class="btn sm admin-only" onclick="addDoctorManual()"' },
  { f: /onclick="bulkDeleteAllDoctors\(\)"/g, r: 'class="btn sm danger admin-only" onclick="bulkDeleteAllDoctors()"' },
  { f: /id="btn-bulk-delete-selected-docs"/g, r: 'id="btn-bulk-delete-selected-docs" class="btn sm danger admin-only"' },

  { f: /onclick="document.getElementById\('chem-upload'\)\.click\(\)"/g, r: 'class="btn sm primary admin-only" onclick="document.getElementById(\'chem-upload\').click()"' },
  { f: /onclick="addChemistManual\(\)"/g, r: 'class="btn sm admin-only" onclick="addChemistManual()"' },
  { f: /onclick="bulkDeleteAllChemists\(\)"/g, r: 'class="btn sm danger admin-only" onclick="bulkDeleteAllChemists()"' },
  { f: /id="btn-bulk-delete-selected-chems"/g, r: 'id="btn-bulk-delete-selected-chems" class="btn sm danger admin-only"' },

  { f: /onclick="document.getElementById\('leave-bal-upload'\)\.click\(\)"/g, r: 'class="btn sm primary admin-only" onclick="document.getElementById(\'leave-bal-upload\').click()"' },
  { f: /onclick="document.getElementById\('holiday-upload'\)\.click\(\)"/g, r: 'class="btn sm primary admin-only" onclick="document.getElementById(\'holiday-upload\').click()"' },
  { f: /onclick="clearAllHolidays\(\)"/g, r: 'class="btn sm danger admin-only" onclick="clearAllHolidays()"' },
  
  { f: /onclick="issueStockToMR\(\)"/g, r: 'class="btn success sm admin-only" onclick="issueStockToMR()"' },
];

replacements.forEach(rep => {
  html = html.replace(rep.f, match => {
    if(match.includes('class=')) return match; // rudimentary check
    return rep.r;
  });
});

// Also fix existing class declarations that we replaced above by stripping old 'class="..."'
html = html.replace(/<button class="[^"]*" (class="[^"]*" onclick="bulkDeleteAllEmployees\(\)")/, '<button $1');
html = html.replace(/<button class="[^"]*" (class="[^"]*" onclick="document.getElementById\('emp-upload'\)\.click\(\)")/, '<button $1');
html = html.replace(/<button class="[^"]*" (class="[^"]*" onclick="addEmployee\(\)")/, '<button $1');

html = html.replace(/<button class="[^"]*" (class="[^"]*" onclick="document.getElementById\('sfc-upload'\)\.click\(\)")/, '<button $1');
html = html.replace(/<button class="[^"]*" (class="[^"]*" onclick="downloadSFCTemplate\(\)")/, '<button $1');
html = html.replace(/<button class="[^"]*" (class="[^"]*" onclick="bulkDeleteAllSFC\(\)")/, '<button $1');

html = html.replace(/<button class="[^"]*" (class="[^"]*" onclick="document.getElementById\('doc-upload'\)\.click\(\)")/, '<button $1');
html = html.replace(/<button class="[^"]*" (class="[^"]*" onclick="addDoctorManual\(\)")/, '<button $1');
html = html.replace(/<button class="[^"]*" (class="[^"]*" onclick="bulkDeleteAllDoctors\(\)")/, '<button $1');

html = html.replace(/<button class="[^"]*" (class="[^"]*" onclick="document.getElementById\('chem-upload'\)\.click\(\)")/, '<button $1');
html = html.replace(/<button class="[^"]*" (class="[^"]*" onclick="addChemistManual\(\)")/, '<button $1');
html = html.replace(/<button class="[^"]*" (class="[^"]*" onclick="bulkDeleteAllChemists\(\)")/, '<button $1');

html = html.replace(/<button class="[^"]*" (class="[^"]*" onclick="document.getElementById\('leave-bal-upload'\)\.click\(\)")/, '<button $1');
html = html.replace(/<button class="[^"]*" (class="[^"]*" onclick="document.getElementById\('holiday-upload'\)\.click\(\)")/, '<button $1');
html = html.replace(/<button class="[^"]*" (class="[^"]*" onclick="clearAllHolidays\(\)")/, '<button $1');
html = html.replace(/<button class="[^"]*" (class="[^"]*" onclick="issueStockToMR\(\)")/, '<button $1');


// 4. Add admin-only to generated JS table buttons
html = html.replace(/<button class="btn sm" style="width:auto;display:inline-block;margin-right:4px;padding:0 8px" onclick="openEmployeeStatusModal/g, '<button class="btn sm admin-only" style="width:auto;display:inline-block;margin-right:4px;padding:0 8px" onclick="openEmployeeStatusModal');
html = html.replace(/<button class="btn sm danger" style="width:auto;padding:0 8px" onclick="removeEmp/g, '<button class="btn sm danger admin-only" style="width:auto;padding:0 8px" onclick="removeEmp');

html = html.replace(/<button class="btn sm danger" onclick="removeDoc/g, '<button class="btn sm danger admin-only" onclick="removeDoc');
html = html.replace(/<button class="btn sm danger" onclick="removeChem/g, '<button class="btn sm danger admin-only" onclick="removeChem');
html = html.replace(/<button class="btn sm danger" onclick="removeHoliday/g, '<button class="btn sm danger admin-only" onclick="removeHoliday');
html = html.replace(/<button class="btn sm danger" onclick="removeSFC/g, '<button class="btn sm danger admin-only" onclick="removeSFC');

// Also remove table head "Action" column for non-admins? It's fine to leave it empty or just let it be. But wait, if they can't delete/manage, the column will just be empty checkboxes?
// Actually, check-all checkboxes can be hidden too.
html = html.replace(/<input type="checkbox" id="check-all-emps"/g, '<input type="checkbox" id="check-all-emps" class="admin-only"');
html = html.replace(/<input type="checkbox" class="emp-row-check"/g, '<input type="checkbox" class="emp-row-check admin-only"');

html = html.replace(/<input type="checkbox" id="check-all-docs"/g, '<input type="checkbox" id="check-all-docs" class="admin-only"');
html = html.replace(/<input type="checkbox" class="doc-row-check"/g, '<input type="checkbox" class="doc-row-check admin-only"');

html = html.replace(/<input type="checkbox" id="check-all-chems"/g, '<input type="checkbox" id="check-all-chems" class="admin-only"');
html = html.replace(/<input type="checkbox" class="chem-row-check"/g, '<input type="checkbox" class="chem-row-check admin-only"');

html = html.replace(/<input type="checkbox" id="check-all-sfc"/g, '<input type="checkbox" id="check-all-sfc" class="admin-only"');
html = html.replace(/<input type="checkbox" class="sfc-row-check"/g, '<input type="checkbox" class="sfc-row-check admin-only"');

fs.writeFileSync('index.html', html, 'utf8');
console.log("Done adding admin-only restrictions");
