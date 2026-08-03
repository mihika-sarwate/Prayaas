const fs = require('fs');
let c = fs.readFileSync('index.html', 'utf8');
c = c.replace(/if \(stat === 'BLOCKED' \|\| stat === 'INACTIVE'/g, "if (stat === 'INACTIVE'");
fs.writeFileSync('index.html', c);
console.log('Done');
