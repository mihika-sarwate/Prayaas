const fs = require('fs');
const path = require('path');
const filePath = path.join(__dirname, 'index.html');
let content = fs.readFileSync(filePath, 'utf8');

const t1 = `  try {
    var res = await runSupabaseDelete('doctors', function(q) {
      return q.in('id', idsToDelete);
    });`;
const r1 = `  try {
    var repRes = await runSupabaseDelete('reports', function(q) {
      return q.in('doc_id', idsToDelete);
    });
    if (repRes && repRes.error) {
      console.warn("Failed to delete related reports: " + repRes.error.message);
    }
    
    var res = await runSupabaseDelete('doctors', function(q) {
      return q.in('id', idsToDelete);
    });`;
content = content.replace(new RegExp(t1.replace(/\r?\n/g, '\\r?\\n'), 'g'), r1);

const t2 = `function bulkDeleteAllDoctors() {
  if (DB.doctors.length === 0) {
    showToast('Doctor list is already empty.');
    return;
  }
  if (!confirm('WARNING: Are you sure you want to delete ALL doctor records (' + DB.doctors.length + ') from the system? This cannot be undone.')) return;
  DB.doctors = [];
  saveDB();
  renderAdminDocList();
  runSupabaseDelete('doctors', function(q) {
    return q.neq('id', 'dummy_value_to_delete_all');
  });
  showToast('All doctor records deleted successfully!');
  var masterCheck = document.getElementById('check-all-docs');
  if (masterCheck) masterCheck.checked = false;
  updateSelectedDocsCount();
}`;

const r2 = `async function bulkDeleteAllDoctors() {
  if (DB.doctors.length === 0) {
    showToast('Doctor list is already empty.');
    return;
  }
  if (!confirm('WARNING: Are you sure you want to delete ALL doctor records (' + DB.doctors.length + ') from the system? This cannot be undone.')) return;
  DB.doctors = [];
  saveDB();
  renderAdminDocList();
  
  await runSupabaseDelete('reports', function(q) {
    return q.not('doc_id', 'is', null);
  });
  
  runSupabaseDelete('doctors', function(q) {
    return q.neq('id', 'dummy_value_to_delete_all');
  });
  showToast('All doctor records deleted successfully!');
  var masterCheck = document.getElementById('check-all-docs');
  if (masterCheck) masterCheck.checked = false;
  updateSelectedDocsCount();
}`;

content = content.replace(new RegExp(t2.replace(/\r?\n/g, '\\r?\\n').replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), r2);

// wait, the RegExp for t2 escapes ALL regex characters AFTER replacing \r?\n. So the \r?\n would become \\r?\\n which is literally what we want, but wait...
// easier to just do split and join for exact match without regex, but with normalized newlines.

// normalize to \n
content = content.replace(/\r\n/g, '\n');

content = content.replace(t1, r1);
content = content.replace(t2, r2);

fs.writeFileSync(filePath, content, 'utf8');
console.log("Done");
