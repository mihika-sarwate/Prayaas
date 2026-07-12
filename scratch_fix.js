const fs = require('fs');
const files = ['index.html', 'live_index.html', 'script_0.js', 'temp_script_0.js', 'temp_script_1.js'];

files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');

  // Replace old managerId assignments with finalMgrId
  content = content.replace(/existing\.managerId=cols\[mgrCol\]\|\|'';/g, 'existing.managerId=finalMgrId;');
  content = content.replace(/managerId:cols\[mgrCol\]\|\|'',/g, 'managerId:finalMgrId,');

  // Insert resolveManagerIdFromUpload logic if not exists
  if (!content.includes('function resolveManagerIdFromUpload')) {
    const searchString = 'var dataLines = headerLineIndex !== -1 ? lines.slice(headerLineIndex + 1) : lines;';
    const dataLinesIdx = content.indexOf(searchString);
    if (dataLinesIdx > -1) {
      const inject = `
    var csvEmpMap = {};
    dataLines.forEach(function(line){
      var cols=parseCSVLine(line);
      if(!cols[idCol]||!cols[nameCol])return;
      var eId = cols[idCol].toUpperCase().trim();
      var name = cols[nameCol].trim();
      csvEmpMap[name.toLowerCase()] = eId;
      csvEmpMap[eId.toLowerCase()] = eId;
    });

    function resolveManagerIdFromUpload(rawMgr) {
      if (!rawMgr) return '';
      var str = rawMgr.trim().toLowerCase();
      if (str === 'none') return '';
      if (csvEmpMap[str]) return csvEmpMap[str];
      var e = DB.employees.find(function(x) { 
        return x && ((x.id||'').trim().toLowerCase() === str || (x.name||'').trim().toLowerCase() === str); 
      });
      return e ? e.id : rawMgr;
    }
`;
      const insertIdx = dataLinesIdx + searchString.length;
      content = content.slice(0, insertIdx) + inject + content.slice(insertIdx);
    }
  } else {
    // Modify existing resolveManagerIdFromUpload to handle 'none'
    content = content.replace(
      'var str = rawMgr.trim().toLowerCase();',
      'var str = rawMgr.trim().toLowerCase();\n      if (str === "none") return "";'
    );
  }

  // Ensure finalMgrId is declared before using it
  content = content.replace(/var eId = cols\[idCol\]\.toUpperCase\(\);\s*var existing=DB\.employees\.find\(function\(em\)\{return em && em\.id===eId;\}\);\s*var newEmp;/g, 'var eId = cols[idCol].toUpperCase();\n      var finalMgrId = resolveManagerIdFromUpload(cols[mgrCol] || "");\n      var existing=DB.employees.find(function(em){return em && em.id===eId;});\n      var newEmp;');

  content = content.replace(/var newEmp;\s*var finalMgrId = resolveManagerIdFromUpload\(cols\[mgrCol\] \|\| ''\);/g, 'var newEmp;');

  fs.writeFileSync(f, content);
  console.log(f + ' updated');
});
