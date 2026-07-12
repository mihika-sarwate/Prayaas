const fs = require('fs');
const files = ['index.html', 'live_index.html', 'script_0.js', 'temp_script_0.js', 'temp_script_1.js'];

files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');

  // Replace e.doj || '' with formatted date
  content = content.replace(
    /e\.doj \|\| '',/g,
    "(function(d){ if(!d) return ''; var p=d.split('-'); if(p.length===3) return p[2]+'/'+p[1]+'/'+p[0]; return d; })(e.doj),"
  );
  
  // Replace dummy data
  content = content.replace(
    /2026-01-01,Maharashtra/g,
    "01/01/2026,Maharashtra"
  );
  content = content.replace(
    /2026-01-01,West Bengal/g,
    "01/01/2026,West Bengal"
  );

  fs.writeFileSync(f, content);
  console.log(f + ' updated');
});
