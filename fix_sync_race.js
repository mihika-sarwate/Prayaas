const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// 1. Add isSyncing flag to syncSupabaseDatabase
html = html.replace(/async function syncSupabaseDatabase\(\) \{\s*try \{/, `var isSyncing = false;\n  async function syncSupabaseDatabase() {\n    if (isSyncing) return;\n    isSyncing = true;\n    try {`);
html = html.replace(/\} catch \(err\) \{\s*console\.error\("Supabase sync failed:", err\);\s*\}\s*\}/, `} catch (err) {\n      console.error("Supabase sync failed:", err);\n    } finally {\n      isSyncing = false;\n    }\n  }`);

// 2. Prevent auto-poll while syncing
html = html.replace(/if \(useSupabase\) \{\s*console\.log\("Auto-polling Supabase data\.\.\."\);\s*await initSupabaseData\(true\);\s*\}/, `if (useSupabase && !isSyncing) {\n      console.log("Auto-polling Supabase data...");\n      await initSupabaseData(true);\n    }`);

// 3. Make upsertInBatches throw error
html = html.replace(/if \(error\) \{\s*console\.error\("Batch upsert failed on table " \+ table \+ ":", error\);\s*\}/, `if (error) {\n        console.error("Batch upsert failed on table " + table + ":", error);\n        throw error;\n      }`);

fs.writeFileSync('index.html', html, 'utf8');
console.log("Done");
