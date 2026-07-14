const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'index.html');
let content = fs.readFileSync(filePath, 'utf8');

const targetStr = `async function acknowledgeAnnouncement() {
  if (!currentModalAnnouncement || !SESSION.user) return;
  var user = SESSION.user;
  var userId = String(user.id || '').trim().toUpperCase();
  
  var ann = DB.announcements.find(a => a.id === currentModalAnnouncement.id);
  if (ann) {
    if (!Array.isArray(ann.acknowledgedBy)) ann.acknowledgedBy = [];
    if (!ann.acknowledgedBy.includes(userId)) {
      ann.acknowledgedBy.push(userId);
    }
  }
  
  saveDB();
  if (typeof syncSupabaseDatabase === 'function') {
    await syncSupabaseDatabase();
  }
  
  var overlay = document.getElementById('announcement-overlay');
  if (overlay) overlay.style.display = 'none';
  currentModalAnnouncement = null;
  
  // Check if there are more announcements to acknowledge
  checkAnnouncements();
}`;

const replacementStr = `async function acknowledgeAnnouncement() {
  if (!currentModalAnnouncement || !SESSION.user) return;
  var user = SESSION.user;
  var userId = String(user.id || '').trim().toUpperCase();
  
  var ann = DB.announcements.find(a => a.id === currentModalAnnouncement.id);
  if (ann) {
    if (!Array.isArray(ann.acknowledgedBy)) ann.acknowledgedBy = [];
    if (!ann.acknowledgedBy.includes(userId)) {
      ann.acknowledgedBy.push(userId);
    }
    
    if (typeof useSupabase !== 'undefined' && useSupabase && typeof supabase !== 'undefined' && supabase) {
      try {
        var res = await supabase.from('announcements').select('acknowledged_by').eq('id', ann.id).single();
        if (res && res.data && res.data.acknowledged_by) {
          var serverAcks = typeof res.data.acknowledged_by === 'string' ? JSON.parse(res.data.acknowledged_by) : res.data.acknowledged_by;
          if (!Array.isArray(serverAcks)) serverAcks = [];
          serverAcks.forEach(id => {
            if (!ann.acknowledgedBy.includes(id)) ann.acknowledgedBy.push(id);
          });
        }
        await supabase.from('announcements').update({ acknowledged_by: ann.acknowledgedBy }).eq('id', ann.id);
      } catch (e) {
        console.error("Error updating acknowledgement:", e);
      }
    }
  }
  
  saveDB();
  if (typeof syncSupabaseDatabase === 'function') {
    syncSupabaseDatabase();
  }
  
  var overlay = document.getElementById('announcement-overlay');
  if (overlay) overlay.style.display = 'none';
  currentModalAnnouncement = null;
  
  // Check if there are more announcements to acknowledge
  checkAnnouncements();
}`;

if (content.includes(targetStr)) {
  content = content.replace(targetStr, replacementStr);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Patch applied successfully.');
} else {
  console.log('Target string not found in index.html');
}
