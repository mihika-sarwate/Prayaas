const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');

const replacement = `        if (assignTo) {
          var normAssignStr = String(assignTo).toUpperCase().trim();
          var normAssignList = normAssignStr.replace(/[^A-Z0-9,]/g, '').split(',').filter(Boolean);
          var validList = [];
          
          if (normAssignList.length > 0) {
            normAssignList.forEach(function(a) {
              if (activeEmpIds.size > 0) {
                if (activeEmpIds.has(a)) validList.push(a);
              } else {
                if (DB.employees.find(x => String(x.id || '').toUpperCase().trim() === a)) validList.push(a);
              }
            });
            if (activeEmpIds.size === 0 && (!DB.employees || DB.employees.length === 0)) {
              validList = normAssignList;
            }
          }
          assignTo = validList.length > 0 ? validList.join(',') : null;
        }`;

content = content.replace(
  /if \(assignTo\) \{\s*var normAssign = String\(assignTo\)\.toUpperCase\(\)\.trim\(\);\s*if \(activeEmpIds\.size > 0 && !activeEmpIds\.has\(normAssign\)\) \{\s*assignTo = null;\s*\} else if \(activeEmpIds\.size === 0 && !DB\.employees\.find\(x => String\(x\.id \|\| ''\)\.toUpperCase\(\)\.trim\(\) === normAssign\)\) \{\s*assignTo = null;\s*\}\s*\}/g,
  replacement
);

fs.writeFileSync('index.html', content);
console.log('Done!');
