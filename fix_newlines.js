const fs = require('fs');
const files = ['index.html', 'live_index.html', 'script_0.js', 'temp_script_0.js', 'temp_script_1.js', 'test_script_0.js'];
files.forEach(f => {
  if (fs.existsSync(f)) {
    let content = fs.readFileSync(f, 'utf8');
    let original = content;
    
    // Replace literal "\n" characters that were accidentally inserted.
    content = content.split('\\\\n          sel.insertAdjacentHTML').join('\\n          sel.insertAdjacentHTML');
    content = content.split('\\\\n                         <option value="INDUCTION').join('\\n                         <option value="INDUCTION');
    content = content.split('\\\\n  var isTransit = wt').join('\\n  var isTransit = wt');
    content = content.split('\\\\n  var needsLocation = isFieldWork').join('\\n  var needsLocation = isFieldWork');
    content = content.split(`\\\\n    if(document.getElementById('r-standard-loc-fields'))`).join(`\\n    if(document.getElementById('r-standard-loc-fields'))`);
    content = content.split(`\\\\n    if(w1) w1.style.display`).join(`\\n    if(w1) w1.style.display`);
    
    if (content !== original) {
      fs.writeFileSync(f, content);
      console.log('Fixed', f);
    }
  }
});
