const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');

const replacement = `  saveDB();
  if (typeof syncSupabaseDatabase === 'function') {
    if (_saveDBSyncTimer) { clearTimeout(_saveDBSyncTimer); _saveDBSyncTimer = null; }
    syncSupabaseDatabase();
  }`;

content = content.replace(/  saveDB\(\);\s*closeModal\('modal-add-doc'\);/g, replacement + "\n  closeModal('modal-add-doc');");
content = content.replace(/  saveDB\(\);\s*closeModal\('modal-add-chem'\);/g, replacement + "\n  closeModal('modal-add-chem');");
content = content.replace(/  saveDB\(\);\s*closeModal\('modal-add-stockist'\);/g, replacement + "\n  closeModal('modal-add-stockist');");

fs.writeFileSync('index.html', content);
console.log('Done!');
