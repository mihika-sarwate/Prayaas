const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// Hide inline forms (cards)
html = html.replace(/<div class="card">\s*<div class="card-title">Add New Employee Record<\/div>/g, '<div class="card admin-only">\n        <div class="card-title">Add New Employee Record</div>');

html = html.replace(/<div class="card">\s*<div class="card-title">Bulk Import Employees<\/div>/g, '<div class="card admin-only">\n        <div class="card-title">Bulk Import Employees</div>');

html = html.replace(/<div class="card">\s*<div class="card-title">&#128230; Issue Stock to Representative<\/div>/g, '<div class="card admin-only">\n        <div class="card-title">&#128230; Issue Stock to Representative</div>');


// Fix javascript generated delete buttons
html = html.replace(/<button class="btn sm danger" style="width:auto;display:inline-block" onclick="removeDoc/g, '<button class="btn sm danger admin-only" style="width:auto;display:inline-block" onclick="removeDoc');

html = html.replace(/<button class="btn sm danger" style="width:auto;display:inline-block" onclick="removeChemist/g, '<button class="btn sm danger admin-only" style="width:auto;display:inline-block" onclick="removeChemist');

html = html.replace(/<button class="btn sm danger" style="width:auto;padding:0 8px" onclick="removeSFC/g, '<button class="btn sm danger admin-only" style="width:auto;padding:0 8px" onclick="removeSFC');

// Leave holiday delete button doesn't have style, let's fix it
html = html.replace(/<button class="btn sm danger" onclick="removeHoliday/g, '<button class="btn sm danger admin-only" onclick="removeHoliday');

// We also need to fix removeEmp and openEmployeeStatusModal if they had style, though I already tried fixing it, let's check
html = html.replace(/<button class="btn sm" style="width:auto;display:inline-block;margin-right:4px;padding:0 8px" onclick="openEmployeeStatusModal/g, '<button class="btn sm admin-only" style="width:auto;display:inline-block;margin-right:4px;padding:0 8px" onclick="openEmployeeStatusModal');
html = html.replace(/<button class="btn sm danger" style="width:auto;padding:0 8px" onclick="removeEmp/g, '<button class="btn sm danger admin-only" style="width:auto;padding:0 8px" onclick="removeEmp');

fs.writeFileSync('index.html', html, 'utf8');
console.log("Done");
