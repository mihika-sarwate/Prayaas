
var DB = {"employees":[{"id":"ADLA128","status":"Active","doj":"2020-01-01","designation":"MR"}],"attendance":[],"reports":[]};
var isLoadingData = true;

function formatDateForPostgres(dateStr) {
  if (!dateStr) return '';
  var parts = dateStr.split('-');
  if (parts.length === 3 && parts[0].length === 4) return dateStr;
  var p = dateStr.split('/');
  if (p.length === 3 && p[2].length === 4) return p[2] + '-' + (p[1].length===1?'0'+p[1]:p[1]) + '-' + (p[0].length===1?'0'+p[0]:p[0]);
  return dateStr;
}

function getYesterdayDateString() {
  return '2026-07-13'; // Mock today as 2026-07-14
}

function offsetDate(dateStr, days) {
  var d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

function ensureAttendanceArrays() {}
function isAttendanceTrackedEmployee() { return true; }
function normalizeEmployeeRecord() {}
function normalizeEmployeeStatus() { return 'Active'; }
function isExecutiveAttendanceExempt() { return false; }
function getHolidayForDateAndState() { return null; }
function isWeeklyOffForEmployee() { return false; }
function getApprovedLeaveStatusForDate() { return null; }

function getAttendanceRecord(empId, dateStr) {
  var safeDate = formatDateForPostgres(dateStr) || dateStr;
  return DB.attendance.find(function(a) {
    return String(a.employeeId || '').toUpperCase() === String(empId || '').toUpperCase() && (formatDateForPostgres(a.date) || a.date) === safeDate;
  });
}

function upsertAttendanceRecord(record) {
  var dateStr = formatDateForPostgres(record.date) || record.date;
  var existing = getAttendanceRecord(record.employeeId, dateStr);
  if (existing) {
    existing.loginTime = record.loginTime !== undefined ? record.loginTime : existing.loginTime;
    existing.attendanceStatus = record.attendanceStatus || existing.attendanceStatus;
    existing.remarks = record.remarks || existing.remarks;
    return existing;
  }
  var entry = {
    id: 'ATT-' + record.employeeId + '-' + dateStr,
    employeeId: record.employeeId,
    date: dateStr,
    loginTime: record.loginTime || '',
    attendanceStatus: record.attendanceStatus || '',
    remarks: record.remarks || ''
  };
  DB.attendance.push(entry);
  return entry;
}

function getAttendanceStatusMeta(emp, dateStr) {
  var existing = getAttendanceRecord(emp.id, dateStr);
  return { status: 'NS', remarks: 'Attendance Not Submitted' };
}

function validateAttendanceForDate(dateStr) {
  var changed = false;
  DB.employees.forEach(function(emp) {
    var statusMeta = getAttendanceStatusMeta(emp, dateStr);
    if (statusMeta.status === 'NS') {
      statusMeta.status = 'A';
      statusMeta.remarks = 'Absent';
    }
    upsertAttendanceRecord({
      employeeId: emp.id,
      date: dateStr,
      attendanceStatus: statusMeta.status,
      remarks: statusMeta.remarks
    });
  });
}

function ensureAttendanceSchedulerUpToDate() {
  var targetEnd = getYesterdayDateString();
  var start = offsetDate(targetEnd, -29);
  var cursor = start;
  while (cursor <= targetEnd) {
    validateAttendanceForDate(cursor);
    cursor = offsetDate(cursor, 1);
  }
}

ensureAttendanceSchedulerUpToDate();
console.log(DB.attendance.filter(a => a.date === '2026-07-13'));
