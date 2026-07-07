const fs = require('fs');
let c = fs.readFileSync('index.html', 'utf8');

const newReplace = `          var normAssignList = normAssignStr.split(',').map(function(s) { return s.trim(); }).filter(Boolean);`;
c = c.replace(/var normAssignList = normAssignStr\.replace\(\/\[\^A-Z0-9,\]\/g, ''\)\.split\(\',\'\)\.filter\(Boolean\);/g, newReplace);

fs.writeFileSync('index.html', c);
console.log('Removed aggressive regex replace');
