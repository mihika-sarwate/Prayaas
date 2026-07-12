const fs = require('fs');
const files = ['index.html', 'live_index.html', 'script_0.js', 'temp_script_0.js', 'temp_script_1.js', 'test_script_0.js'];

files.forEach(f => {
  if (fs.existsSync(f)) {
    const c = fs.readFileSync(f, 'utf8');
    if (c.includes("const doctors = await fetchAllFromSupabase('doctors');")) {
      console.log(f + ' contains the sequential fetch block.');
    }
  }
});
