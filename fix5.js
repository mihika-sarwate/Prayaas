const fs = require('fs');
let c = fs.readFileSync('index.html', 'utf8');

const repairCode = `
  // Auto-repair any unassigned records using beName (for doctors) or similar logic
  var didRepair = false;
  
  if (DB.doctors) {
    DB.doctors.forEach(d => {
      if ((!d.assignTo || d.assignTo === 'UNASSIGNED') && d.beName) {
        var match = DB.employees.find(e => String(e.name).toUpperCase().trim() === String(d.beName).toUpperCase().trim());
        if (match) {
          d.assignTo = match.id;
          didRepair = true;
        }
      }
    });
  }

  if (didRepair) {
    console.log('Auto-repaired unassigned doctors based on BE Name.');
    saveDB();
    if (typeof syncSupabaseDatabase === 'function') {
      setTimeout(syncSupabaseDatabase, 3000); // give it a moment, then push to cloud
    }
  }
`;

c = c.replace(/if \(isSilent !== true\) showToast\("Supabase data synchronized!"\);/, repairCode + '\n    if (isSilent !== true) showToast("Supabase data synchronized!");');

fs.writeFileSync('index.html', c);
console.log('Repair logic injected.');
