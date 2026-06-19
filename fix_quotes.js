const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// The bad line:
// onclick="openEmployeeStatusModal(' + JSON.stringify(e.id || '') + ')"
html = html.replace(/onclick="openEmployeeStatusModal\('\ \+\ JSON\.stringify\((.*?)\)\ \+\ '\)"/g, 
  "onclick=\\'openEmployeeStatusModal(' + JSON.stringify($1) + ')\\'");

// The bad line for removeEmp:
// onclick="removeEmp(' + JSON.stringify(e.id || '') + ')"
html = html.replace(/onclick="removeEmp\('\ \+\ JSON\.stringify\((.*?)\)\ \+\ '\)"/g, 
  "onclick=\\'removeEmp(' + JSON.stringify($1) + ')\\'");

// The bad lines for setEmployeeStatus:
// onclick="setEmployeeStatus(' + JSON.stringify(emp.id) + ', ' + JSON.stringify('Hold') + ')"
html = html.replace(/onclick="setEmployeeStatus\('\ \+\ JSON\.stringify\((.*?)\)\ \+\ ',\ '\ \+\ JSON\.stringify\((.*?)\)\ \+\ '\)"/g, 
  "onclick=\\'setEmployeeStatus(' + JSON.stringify($1) + ', ' + JSON.stringify($2) + ')\\'");

fs.writeFileSync('index.html', html, 'utf8');
console.log("Quotes fixed!");
