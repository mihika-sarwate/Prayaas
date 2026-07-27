const fs = require('fs');
const files = ['index.html', 'live_index.html', 'script_0.js', 'temp_script_0.js', 'temp_script_1.js', 'test_script_0.js'];
files.forEach(f => {
  if (fs.existsSync(f)) {
    let content = fs.readFileSync(f, 'utf8');
    let original = content;
    
    const literalN = String.fromCharCode(92) + 'n';
    
    // Check if the literal \n is there and replace it
    while (content.includes(literalN)) {
      content = content.replace(literalN, '\n');
    }
    
    if (content !== original) {
      fs.writeFileSync(f, content);
      console.log('Fixed', f);
    }
  }
});
