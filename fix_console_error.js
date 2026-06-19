const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// Omit designation from dbEmps so we don't trigger 400 Bad Request and scary console errors
html = html.replace(/designation: \(e\.designation \|\| ''\)\.trim\(\) \|\| getDefaultEmployeeDesignation\(e\.role\),/, `// designation omitted because table doesn't have it`);

fs.writeFileSync('index.html', html, 'utf8');
console.log("Done");
