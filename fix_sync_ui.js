const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// 1. Modify showToast to support duration
html = html.replace(/function showToast\(msg\)\{/, `function showToast(msg, duration){`);
html = html.replace(/setTimeout\(function\(\)\{t\.style\.display='none';\},2800\);/, `setTimeout(function(){t.style.display='none';}, duration || 2800);`);

// 2. Add loading toast to syncSupabaseDatabase
html = html.replace(/isSyncing = true;\n\s*try \{/, `isSyncing = true;\n    var dbStatus = document.getElementById('db-status-indicator');\n    if (dbStatus) dbStatus.textContent = 'Syncing to Cloud... Please wait';\n    try {`);

html = html.replace(/\} catch \(err\) \{\n\s*console\.error\("Supabase sync failed:", err\);\n\s*\} finally \{/, `} catch (err) {\n      console.error("Supabase sync failed:", err);\n    } finally {\n      var dbStatus = document.getElementById('db-status-indicator');\n      if (dbStatus) dbStatus.textContent = 'Database Connection: Supabase Cloud';\n      showToast("Cloud Sync Complete!", 3000);\n`);

// 3. Change chunkSize
html = html.replace(/async function upsertInBatches\(table, dataArray, chunkSize = 200\) \{/, `async function upsertInBatches(table, dataArray, chunkSize = 1000) {`);

fs.writeFileSync('index.html', html, 'utf8');
console.log("Done");
