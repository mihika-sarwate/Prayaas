const fs = require('fs');
const files = ['index.html', 'live_index.html', 'script_0.js', 'temp_script_0.js', 'temp_script_1.js', 'test_script_0.js'];

files.forEach(f => {
  if (fs.existsSync(f)) {
    let content = fs.readFileSync(f, 'utf8');
    let modified = false;

    // Doctor filter
    if (content.includes('function filterReportingDoctorsDropdown() {') && !content.includes("var searchDocInp = document.getElementById('r-doc-search');")) {
      content = content.replace(/function filterReportingDoctorsDropdown\(\) \{\s*var filtered = window\._allReportingDocs \|\| \[\];/g, `function filterReportingDoctorsDropdown() {
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

    // Chemist filter
    if (content.includes('function filterReportingChemistsDropdown() {') && !content.includes("var searchChemInp = document.getElementById('r-chem-search-inp');")) {
      content = content.replace(/function filterReportingChemistsDropdown\(\) \{\s*var filtered = window\._allReportingChems \|\| \[\];/g, `function filterReportingChemistsDropdown() {
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
