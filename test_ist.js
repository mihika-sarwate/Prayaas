function getISTDateObj(dateObj) {
  var d = dateObj ? new Date(dateObj) : new Date();
  var formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
  });
  var parts = formatter.formatToParts(d);
  var p = {};
  for (var i = 0; i < parts.length; i++) {
      p[parts[i].type] = parts[i].value;
  }
  return {
      year: parseInt(p.year, 10),
      month: parseInt(p.month, 10),
      day: parseInt(p.day, 10),
      hour: parseInt(p.hour, 10),
      minute: parseInt(p.minute, 10),
      second: parseInt(p.second, 10)
  };
}

function getTodayDateString() {
  var ist = getISTDateObj();
  return ist.year + '-' + String(ist.month).padStart(2, '0') + '-' + String(ist.day).padStart(2, '0');
}

function formatLocalDate(dateObj) {
  var ist = getISTDateObj(dateObj);
  return ist.year + '-' + String(ist.month).padStart(2, '0') + '-' + String(ist.day).padStart(2, '0');
}

function offsetDate(dateStr, offsetDays) {
  var parts = String(dateStr || '').split('-');
  var d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
  d.setDate(d.getDate() + offsetDays);
  return formatLocalDate(d);
}

console.log('Today:', getTodayDateString());
console.log('formatLocalDate PST new Date(2026, 6, 8):', formatLocalDate(new Date(2026, 6, 8))); // Note Node uses local TZ anyway
console.log('offsetDate 2026-07-08 + 1:', offsetDate('2026-07-08', 1));
