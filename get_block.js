const fs = require('fs');
const c = fs.readFileSync('index.html', 'utf8');
const start = c.indexOf("const doctors = await fetchAllFromSupabase('doctors');");
const end = c.indexOf("const holData = await fetchAllFromSupabase('holidays', { allowMissing: true });");
console.log(c.substring(start, end + 79));
