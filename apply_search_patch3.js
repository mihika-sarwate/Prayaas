const fs = require('fs');
const files = ['live_index.html', 'script_0.js', 'temp_script_0.js', 'temp_script_1.js', 'test_script_0.js'];

files.forEach(f => {
  if (fs.existsSync(f)) {
    let content = fs.readFileSync(f, 'utf8');
    let modified = false;

    // Add search to createMultiSelect if it doesn't have customInput yet
    if (content.includes("dropdown.className = 'multiselect-dropdown';") && !content.includes("var customInputWrap = document.createElement('div');")) {
      content = content.replace("dropdown.className = 'multiselect-dropdown';", `dropdown.className = 'multiselect-dropdown';
  
  var searchWrap = document.createElement('div');
  searchWrap.style.padding = '4px 8px';
  var searchInput = document.createElement('input');
  searchInput.type = 'text';
  searchInput.placeholder = 'Search...';
  searchInput.style.width = '100%';
  searchInput.style.padding = '4px';
  searchInput.style.border = '1px solid var(--border)';
  searchInput.style.borderRadius = '4px';
  searchInput.oninput = function(e) {
    var val = searchInput.value.toLowerCase().trim();
    var optionsList = dropdown.querySelectorAll('.multiselect-option');
    optionsList.forEach(function(item) {
       var text = item.textContent.toLowerCase();
       if (text.indexOf(val) > -1) {
         item.style.display = 'block';
       } else {
         item.style.display = 'none';
       }
    });
  };
  searchWrap.appendChild(searchInput);
  dropdown.appendChild(searchWrap);
`);
      modified = true;
      console.log(f + ': patched createMultiSelect with search');
    }

    if (modified) {
      fs.writeFileSync(f, content);
    }
  }
});
