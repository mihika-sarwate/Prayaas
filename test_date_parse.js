function formatDateForPostgres(dateStr) {
  if (!dateStr) return null;
  var d = String(dateStr).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(d)) return d;
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(d)) {
    var parts = d.split('/');
    return parts[2] + '-' + parts[1] + '-' + parts[0];
  }
  return null;
}

function formatSupabaseDateToIST(dateStr) {
  if (!dateStr) return null;
  var raw = String(dateStr).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
  var d = new Date(raw);
  if (isNaN(d.getTime())) return formatDateForPostgres(raw);
  var parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(d);
  var map = {};
  for (var i = 0; i < parts.length; i++) {
    map[parts[i].type] = parts[i].value;
  }
  return map.year + '-' + map.month + '-' + map.day;
}

function normalizeReportDateValue(dateStr) {
  if (!dateStr) return null;
  return formatSupabaseDateToIST(dateStr) || formatDateForPostgres(dateStr) || String(dateStr).trim();
}

console.log('Normalized 2026-07-11T18:30:00.000Z:', normalizeReportDateValue('2026-07-11T18:30:00.000Z'));
console.log('Normalized 2026-07-12:', normalizeReportDateValue('2026-07-12'));
