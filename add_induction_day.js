const fs = require('fs');
const files = ['index.html', 'live_index.html', 'script_0.js', 'temp_script_0.js', 'temp_script_1.js', 'test_script_0.js'];

files.forEach(f => {
  if (fs.existsSync(f)) {
    let content = fs.readFileSync(f, 'utf8');
    let modified = false;

    // 1. populateReportWorkTypeOptions
    if (content.includes("sel.insertAdjacentHTML('beforeend', '<option value=\"SALES CLOSING DAY\">SALES CLOSING DAY</option>');") && !content.includes("INDUCTION DAY</option>")) {
      content = content.replace(
        "sel.insertAdjacentHTML('beforeend', '<option value=\"SALES CLOSING DAY\">SALES CLOSING DAY</option>');",
        "sel.insertAdjacentHTML('beforeend', '<option value=\"SALES CLOSING DAY\">SALES CLOSING DAY</option>');\\n          sel.insertAdjacentHTML('beforeend', '<option value=\"INDUCTION DAY\">INDUCTION DAY</option>');"
      );
      modified = true;
    }

    // 2. MTP mgrOptions
    if (content.includes("'<option value=\"SALES CLOSING DAY\"' + (workType === 'SALES CLOSING DAY' ? ' selected' : '') + '>SALES CLOSING DAY</option>' : '';") && !content.includes("INDUCTION DAY</option>' : '';")) {
      content = content.replace(
        "'<option value=\"SALES CLOSING DAY\"' + (workType === 'SALES CLOSING DAY' ? ' selected' : '') + '>SALES CLOSING DAY</option>' : '';",
        "'<option value=\"SALES CLOSING DAY\"' + (workType === 'SALES CLOSING DAY' ? ' selected' : '') + '>SALES CLOSING DAY</option>' +\\n                         '<option value=\"INDUCTION DAY\"' + (workType === 'INDUCTION DAY' ? ' selected' : '') + '>INDUCTION DAY</option>' : '';"
      );
      modified = true;
    }

    // 3. toggleReportWorkTypeFields
    if (content.includes("var isTransit = wt && wt.value === 'TRANSIT';") && !content.includes("var isInductionDay = wt && wt.value === 'INDUCTION DAY';")) {
      content = content.replace(
        "var isTransit = wt && wt.value === 'TRANSIT';\\n  var needsLocation = isFieldWork || isTransit;",
        "var isInductionDay = wt && wt.value === 'INDUCTION DAY';\\n  var isTransit = wt && wt.value === 'TRANSIT';\\n  var needsLocation = isFieldWork || isTransit || isInductionDay;"
      );
      content = content.replace(
        "} else if (isFieldWork) {\\n    if(document.getElementById('r-standard-loc-fields'))",
        "} else if (isFieldWork || isInductionDay) {\\n    if(document.getElementById('r-standard-loc-fields'))"
      );
      content = content.replace(
        "if (targetSel) targetSel.disabled = !isFieldWork;",
        "if (targetSel) targetSel.disabled = !(isFieldWork || isInductionDay);"
      );
      content = content.replace(
        "if (!isFieldWork) {\\n    if(w1) w1.style.display = 'none';",
        "if (!(isFieldWork || isInductionDay)) {\\n    if(w1) w1.style.display = 'none';"
      );
      modified = true;
    }

    // 4. saveReport docId validation
    if (content.includes("if(!docId){showToast('Please select doctor');return;}") && !content.includes("repObj.workType !== 'INDUCTION DAY'")) {
      content = content.replace(
        "if(!docId){showToast('Please select doctor');return;}",
        "if(!docId && repObj.workType !== 'INDUCTION DAY'){showToast('Please select doctor');return;}"
      );
      modified = true;
    }

    if (modified) {
      fs.writeFileSync(f, content);
      console.log(f + ' patched successfully.');
    }
  }
});
