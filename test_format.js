function formatSupabaseDateToIST(dateStr) {
  if (!dateStr) return null;
  var raw = String(dateStr).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
  var d = new Date(raw);
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

console.log("From 18:30Z string:", formatSupabaseDateToIST("2026-07-11T18:30:00+00:00"));
console.log("From 18:30.000Z string:", formatSupabaseDateToIST("2026-07-11T18:30:00.000Z"));
