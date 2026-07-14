const DB = {
  reports: [
    {
      id: 'REP1783866110849',
      empId: 'TEST01',
      date: '2026-07-12',
      isFinal: true
    }
  ]
};
const emp = { id: 'TEST01' };
const curDate = '2026-07-12';

function formatDateForPostgres(dateStr) {
  if (!dateStr) return null;
  dateStr = String(dateStr).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
  return dateStr;
}

var finalDcrExists = (DB.reports || []).some(function(r) {
  return String(r.empId || '').toUpperCase() === String(emp.id || '').toUpperCase() && 
         (formatDateForPostgres(r.date) || r.date) === curDate &&
         r.isFinal === true;
});

console.log("finalDcrExists:", finalDcrExists);
