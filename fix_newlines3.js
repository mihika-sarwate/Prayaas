const fs = require('fs');
const files = ['index.html', 'live_index.html', 'script_0.js', 'temp_script_0.js', 'temp_script_1.js', 'test_script_0.js'];
files.forEach(f => {
  if (fs.existsSync(f)) {
    let content = fs.readFileSync(f, 'utf8');
    let original = content;
    
    // literal backslash followed by n
    const literalN = String.fromCharCode(92) + 'n';
    
    // We split by this literal string
    content = content.split(literalN).join('\n');
    
    if (content !== original) {
      fs.writeFileSync(f, content);
      console.log('Fixed', f);
    }
  }
});
