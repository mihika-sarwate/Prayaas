const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// Hide the Edit buttons for Doctor and Chemist tables
html = html.replace(/<button class="btn sm primary" style="width:auto;display:inline-block;margin-right:4px" onclick="editDoctor/g, '<button class="btn sm primary admin-only" style="width:auto;display:inline-block;margin-right:4px" onclick="editDoctor');

html = html.replace(/<button class="btn sm primary" style="width:auto;display:inline-block;margin-right:4px" onclick="editChemist/g, '<button class="btn sm primary admin-only" style="width:auto;display:inline-block;margin-right:4px" onclick="editChemist');

fs.writeFileSync('index.html', html, 'utf8');
console.log("Done");
