const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'index.html');
let content = fs.readFileSync(filePath, 'utf8');

const target1 = `  try {
    var res = await runSupabaseDelete('doctors', function(q) {
      return q.in('id', idsToDelete);
    });`;

const replace1 = `  try {
    var repRes = await runSupabaseDelete('reports', function(q) {
      return q.in('doc_id', idsToDelete);
    });
    if (repRes && repRes.error) {
      console.warn("Failed to delete related reports: " + repRes.error.message);
    }
    
    var res = await runSupabaseDelete('doctors', function(q) {
      return q.in('id', idsToDelete);
    });`;

content = content.replace(target1, replace1);

const target2 = `function bulkDeleteAllDoctors() {
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

const replace2 = `async function bulkDeleteAllDoctors() {
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

content = content.replace(target2, replace2);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Fix applied!');
