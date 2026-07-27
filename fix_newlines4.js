const fs = require('fs');
const files = ['index.html', 'live_index.html', 'script_0.js', 'temp_script_0.js', 'temp_script_1.js', 'test_script_0.js'];
files.forEach(f => {
  if (fs.existsSync(f)) {
    let content = fs.readFileSync(f, 'utf8');
    let original = content;
    
    // literal backslash followed by n
    const literalN = String.fromCharCode(92) + 'n';
    
    // Only replace specific insertions
    content = content.split(literalN + '          sel.insertAdjacentHTML').join('\n          sel.insertAdjacentHTML');
    content = content.split(literalN + '                         <option value="INDUCTION').join('\n                         <option value="INDUCTION');
    content = content.split(literalN + '  var isTransit').join('\n  var isTransit');
    content = content.split(literalN + '  var needsLocation').join('\n  var needsLocation');
    content = content.split(literalN + '    if(document.getElementById').join('\n    if(document.getElementById');
    content = content.split(literalN + '    if(w1)').join('\n    if(w1)');
    
    if (content !== original) {
      fs.writeFileSync(f, content);
      console.log('Fixed', f);
    }
  }
});
