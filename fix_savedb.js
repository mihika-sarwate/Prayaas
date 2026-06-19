const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

html = html.replace(
  /function saveDB\(\) \{\s*localStorage\.setItem\('adonis_db', JSON\.stringify\(DB\)\);\s*if \(useSupabase\) \{\s*syncSupabaseDatabase\(\);\s*\}\s*\}/,
  `function saveDB() {
    try {
      localStorage.setItem('adonis_db', JSON.stringify(DB));
    } catch (e) {
      console.warn("localStorage quota exceeded. Skipping local save to ensure Supabase sync runs.");
    }
    if (useSupabase) {
      syncSupabaseDatabase();
    }
  }`
);

fs.writeFileSync('index.html', html, 'utf8');
console.log("Done");
