const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// 1. Add escapeHTML if not exists
if (!html.includes('function escapeHTML')) {
  const escapeFunc = `function escapeHTML(str) {
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
`;
  html = html.replace('// Utility Helpers', '// Utility Helpers\n' + escapeFunc);
}

// 2. Replace the flawed onclick generation
html = html.replace(/onclick=\\'([a-zA-Z0-9_]+)\('\ \+\ JSON\.stringify\((.*?)\)\ \+\ '\)\\'/g, 
  'onclick="$1(\' + escapeHTML(JSON.stringify($2)) + \')"');

html = html.replace(/onclick=\\'([a-zA-Z0-9_]+)\('\ \+\ JSON\.stringify\((.*?)\)\ \+\ ',\ '\ \+\ JSON\.stringify\((.*?)\)\ \+\ '\)\\'/g, 
  'onclick="$1(\' + escapeHTML(JSON.stringify($2)) + \', \' + escapeHTML(JSON.stringify($3)) + \')"');

fs.writeFileSync('index.html', html, 'utf8');
console.log("HTML escaping applied!");
