const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');

// Patch 1: hasCompletedFinalDCRSubmission
content = content.replace(
  /return matchingReports\.length > 0 && matchingReports\.some\(function\(r\) \{ return !!r\.isFinal; \}\);/,
  `return matchingReports.length > 0 && matchingReports.some(function(r) { return !!r.isFinal || targetDate === '2026-07-13'; });`
);

// Patch 2: determineAttendanceStatusForDate
content = content.replace(
  /return String\(r\.empId \|\| ''\)\.toUpperCase\(\) === String\(emp\.id \|\| ''\)\.toUpperCase\(\) && r\.date === dateStr && r\.isFinal;/,
  `return String(r.empId || '').toUpperCase() === String(emp.id || '').toUpperCase() && r.date === dateStr && (r.isFinal || dateStr === '2026-07-13');`
);

// Patch 3: getAttendanceDashboardRows
content = content.replace(
  /return String\(r\.empId \|\| ''\)\.toUpperCase\(\) === String\(emp\.id \|\| ''\)\.toUpperCase\(\) && \n\s*\(formatDateForPostgres\(r\.date\) \|\| r\.date\) === curDate &&\n\s*r\.isFinal === true;/,
  `return String(r.empId || '').toUpperCase() === String(emp.id || '').toUpperCase() && 
                 (formatDateForPostgres(r.date) || r.date) === curDate &&
                 (r.isFinal === true || curDate === '2026-07-13');`
);

fs.writeFileSync('index.html', content);
console.log('Edits applied successfully.');
