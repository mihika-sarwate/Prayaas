const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// Replace the start of syncSupabaseDatabase
html = html.replace(/var isSyncing = false;\s+async function syncSupabaseDatabase\(\) \{\s+if \(isSyncing\) return;\s+isSyncing = true;/, `var isSyncing = false;
var syncPending = false;
  async function syncSupabaseDatabase() {
    if (isSyncing) {
      syncPending = true;
      return;
    }
    isSyncing = true;
    syncPending = false;`);

// Replace the end of syncSupabaseDatabase
html = html.replace(/isSyncing = false;\s+\}\s+\}\s+initSupabaseData\(\);/, `isSyncing = false;
      if (syncPending) {
        setTimeout(syncSupabaseDatabase, 1000);
      }
    }
  }

  initSupabaseData();`);

fs.writeFileSync('index.html', html, 'utf8');
console.log("Done");
