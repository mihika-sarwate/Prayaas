const fs = require('fs');
let c = fs.readFileSync('index.html', 'utf8');

const targetStr = "var normAssignList = normAssignStr.replace(/[^A-Z0-9,]/g, '').split(',').filter(Boolean);";
const replaceStr = "var normAssignList = normAssignStr.split(',').map(function(s){return s.trim();}).filter(Boolean);";

while (c.indexOf(targetStr) !== -1) {
  c = c.replace(targetStr, replaceStr);
}

fs.writeFileSync('index.html', c);
console.log('Done replacement');
