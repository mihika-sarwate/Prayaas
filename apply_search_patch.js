const fs = require('fs');
const files = ['index.html', 'live_index.html', 'script_0.js', 'temp_script_0.js', 'temp_script_1.js', 'test_script_0.js'];

files.forEach(f => {
  if (fs.existsSync(f)) {
    let content = fs.readFileSync(f, 'utf8');
    let modified = false;

    if (content.includes('customInput.onkeydown = function(e) {') && !content.includes('customInput.oninput = function(e) {')) {
      content = content.replace('customInput.onkeydown = function(e) {', `customInput.oninput = function(e) {
    var val = customInput.value.toLowerCase().trim();
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
  customInput.onkeydown = function(e) {`);
      modified = true;
      console.log(f + ': patched createMultiSelect');
    }

    if (content.includes('<select id="r-doctor"') && !content.includes('<input type="text" id="r-doc-search"')) {
      content = content.replace('<select id="r-doctor"', `<input type="text" id="r-doc-search" placeholder="Search Doctor..." style="width:100%; margin-bottom:5px; padding:4px; border:1px solid var(--border); border-radius:4px;" oninput="filterReportingDoctorsDropdown()"><br><select id="r-doctor"`);
      modified = true;
      console.log(f + ': patched Doctor Input');
    }

    if (content.includes('<select id="r-chemist"') && !content.includes('<input type="text" id="r-chem-search-inp"')) {
      content = content.replace('<select id="r-chemist"', `<input type="text" id="r-chem-search-inp" placeholder="Search Chemist..." style="width:100%; margin-bottom:5px; padding:4px; border:1px solid var(--border); border-radius:4px;" oninput="filterReportingChemistsDropdown()"><br><select id="r-chemist"`);
      modified = true;
      console.log(f + ': patched Chemist Input');
    }

    if (content.includes('<select id="r-stockist"') && !content.includes('<input type="text" id="r-stockist-search-inp"')) {
      content = content.replace('<select id="r-stockist"', `<input type="text" id="r-stockist-search-inp" placeholder="Search Stockist..." style="width:100%; margin-bottom:5px; padding:4px; border:1px solid var(--border); border-radius:4px;" oninput="filterReportingStockistsDropdown()"><br><select id="r-stockist"`);
      modified = true;
      console.log(f + ': patched Stockist Input');
    }

    if (content.includes('function filterReportingChemistsDropdown() {') && !content.includes('function filterReportingStockistsDropdown() {')) {
      const stockistFunc = `
function filterReportingStockistsDropdown() {
  var filtered = window._allReportingStockists || (window.DB ? window.DB.stockists : []) || [];
  
  var citySel = document.getElementById('r-city');
  var patchSel = document.getElementById('r-patch');
  var city = citySel ? citySel.value.toLowerCase().trim() : '';
  var patch = patchSel ? patchSel.value.toLowerCase().trim() : '';

  var selectedCities = city ? city.split(',').map(function(s){return s.trim();}).filter(Boolean) : [];
  var selectedPatches = patch ? patch.split(',').map(function(s){return s.trim();}).filter(Boolean) : [];

  filtered = filtered.filter(function(s) {
    if (selectedCities.length > 0 && !selectedCities.includes((s.city || '').toLowerCase().trim())) return false;
    if (selectedPatches.length > 0 && !selectedPatches.includes((s.area || '').toLowerCase().trim())) return false;
    return true;
  });

  var searchStockInp = document.getElementById('r-stockist-search-inp');
  var searchStockVal = searchStockInp ? searchStockInp.value.toLowerCase().trim() : '';
  if (searchStockVal) {
    filtered = filtered.filter(function(s) {
      return (s.name || '').toLowerCase().includes(searchStockVal) || (s.area || '').toLowerCase().includes(searchStockVal);
    });
  }

  if (typeof renderStockistOptions === 'function') {
    renderStockistOptions(filtered);
  } else {
    // Basic rendering if function doesn't exist
    var sel = document.getElementById('r-stockist');
    if(sel) {
       sel.innerHTML = '<option value="">-- Select Stockist --</option>';
       filtered.forEach(function(s){
         var opt = document.createElement('option');
         opt.value = s.id;
         opt.textContent = (s.name || '') + ' (' + (s.area || 'No Area') + ')';
         sel.appendChild(opt);
       });
    }
  }
}
`;
      content = content.replace('function filterReportingChemistsDropdown() {', stockistFunc + '\\nfunction filterReportingChemistsDropdown() {');
      modified = true;
      console.log(f + ': patched Stockist function');
    }

    if (content.includes('function filterReportingDoctorsDropdown() {') && !content.includes("document.getElementById('r-doc-search')")) {
      content = content.replace(/function filterReportingDoctorsDropdown\(\) \{\s*var filtered = window\._allReportingDocs \|\| \[\];/, `function filterReportingDoctorsDropdown() {
  var filtered = window._allReportingDocs || [];
  var searchDocInp = document.getElementById('r-doc-search');
  var searchDocVal = searchDocInp ? searchDocInp.value.toLowerCase().trim() : '';
  if (searchDocVal) {
    filtered = filtered.filter(function(d) {
      return (d.name || '').toLowerCase().includes(searchDocVal) || (d.area || '').toLowerCase().includes(searchDocVal);
    });
  }`);
      modified = true;
      console.log(f + ': patched filterReportingDoctorsDropdown');
    }

    if (content.includes('function filterReportingChemistsDropdown() {') && !content.includes("document.getElementById('r-chem-search-inp')")) {
      content = content.replace(/function filterReportingChemistsDropdown\(\) \{\s*var filtered = window\._allReportingChems \|\| \[\];/, `function filterReportingChemistsDropdown() {
  var filtered = window._allReportingChems || [];
  var searchChemInp = document.getElementById('r-chem-search-inp');
  var searchChemVal = searchChemInp ? searchChemInp.value.toLowerCase().trim() : '';
  if (searchChemVal) {
    filtered = filtered.filter(function(c) {
      return (c.name || '').toLowerCase().includes(searchChemVal) || (c.area || '').toLowerCase().includes(searchChemVal);
    });
  }`);
      modified = true;
      console.log(f + ': patched filterReportingChemistsDropdown');
    }

    if (modified) {
      fs.writeFileSync(f, content);
    }
  }
});
