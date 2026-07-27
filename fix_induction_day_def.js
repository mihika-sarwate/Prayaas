const fs = require('fs');
const files = ['index.html', 'live_index.html', 'script_0.js', 'temp_script_0.js', 'temp_script_1.js', 'test_script_0.js'];

files.forEach(f => {
  if (!fs.existsSync(f)) return;
  let content = fs.readFileSync(f, 'utf8');
  let lines = content.split(/\r?\n/);
  let modified = false;

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes("function toggleReportWorkTypeFields()")) {
      // Look for the next few lines defining the flags
      let j = i + 1;
      let foundIsTransit = -1;
      let foundNeedsLocation = -1;
      while (j < i + 10 && j < lines.length) {
        if (lines[j].includes("var isTransit = wt && wt.value === 'TRANSIT';")) {
          foundIsTransit = j;
        }
        if (lines[j].includes("var needsLocation = isFieldWork || isTransit;")) {
          foundNeedsLocation = j;
        }
        j++;
      }

      if (foundIsTransit !== -1 && !content.includes("var isInductionDay = wt && wt.value === 'INDUCTION DAY';")) {
        // Insert isInductionDay definition
        lines.splice(foundIsTransit + 1, 0, "  var isInductionDay = wt && wt.value === 'INDUCTION DAY';");
        modified = true;
        // Adjust index since we spliced
        if (foundNeedsLocation >= foundIsTransit) {
          foundNeedsLocation++;
        }
      }
      
      // Update needsLocation to include isInductionDay
      if (foundNeedsLocation !== -1) {
        lines[foundNeedsLocation] = "  var needsLocation = isFieldWork || isTransit || isInductionDay;";
        modified = true;
      }
    }
  }

  if (modified) {
    fs.writeFileSync(f, lines.join('\n'));
    console.log('Fixed toggleReportWorkTypeFields in', f);
  }
});
