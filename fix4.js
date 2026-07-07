const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');

const docResolveScript = `      var assignToVal = (p[empIdCol]||'').toUpperCase().trim();
      var beName = (p[beNameCol]||'').trim();
      
      // Auto-resolve Employee ID from Name or BE Name
      if (assignToVal && assignToVal !== 'UNASSIGNED') {
        var exactMatch = DB.employees.find(e => String(e.id).toUpperCase() === assignToVal);
        if (!exactMatch) {
          var nameMatch = DB.employees.find(e => String(e.name).toUpperCase().trim() === assignToVal);
          if (nameMatch) assignToVal = String(nameMatch.id).toUpperCase();
        }
      }
      if ((!assignToVal || assignToVal === 'UNASSIGNED') && beName) {
        var beMatch = DB.employees.find(e => String(e.name).toUpperCase().trim() === beName.toUpperCase());
        if (beMatch) assignToVal = String(beMatch.id).toUpperCase();
      }
`;

content = content.replace(/      var assignToVal = \(p\[empIdCol\]\|\|''\)\.toUpperCase\(\);/g, docResolveScript);

const chemResolveScript = `      var assignToVal = (p[assignCol]||'').toUpperCase().trim();
      // Auto-resolve Employee ID from Name
      if (assignToVal && assignToVal !== 'UNASSIGNED') {
        var exactMatch = DB.employees.find(e => String(e.id).toUpperCase() === assignToVal);
        if (!exactMatch) {
          var nameMatch = DB.employees.find(e => String(e.name).toUpperCase().trim() === assignToVal);
          if (nameMatch) assignToVal = String(nameMatch.id).toUpperCase();
        }
      }`;

content = content.replace(/      var assignToVal = \(p\[assignCol\]\|\|''\)\.toUpperCase\(\);/g, chemResolveScript);

fs.writeFileSync('index.html', content);
console.log('Done resolving logic');
