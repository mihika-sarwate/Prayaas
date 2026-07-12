const fs = require('fs');

const files = ['index.html', 'live_index.html', 'script_0.js', 'temp_script_0.js', 'temp_script_1.js', 'test_script_0.js'];

files.forEach(f => {
  if (!fs.existsSync(f)) return;
  let c = fs.readFileSync(f, 'utf8');
  let updated = false;

  // 1. Revert finalSubmitToday() to standard form
  const revertRegex = /saveDB\(\);\s*\/\/ NEW LOGIC: Immediate Attendance Update[\s\S]*?pushPromises\.push\(supabase\.from\('attendance'\)\.upsert\(dbAtt, \{ onConflict: 'employee_id, date' \}\)\.select\(\)\.catch\(function\(e\)\{console\.error\(e\)\}\)\);\s*\}/;
  if (c.match(revertRegex)) {
    const origSubmitLogic = `
  saveDB();
  
  var pushPromises = myTodayReports.map(function(r) {
    return pushReportToSupabase(r).catch(function(e) { console.error(e); });
  });`;
    c = c.replace(revertRegex, origSubmitLogic.trim());
    updated = true;
  }

  // 2. Enhance getAttendanceDashboardRows() to dynamically check for Final DCR
  const dashRegex = /function getAttendanceDashboardRows\(\) \{[\s\S]*?\}\)\;\n\}/;
  if (c.match(dashRegex)) {
    const newDashLogic = `function getAttendanceDashboardRows() {
  var employeeFilter = (document.getElementById('attendance-employee-filter') || {}).value || '';
  var statusFilter = (document.getElementById('attendance-status-filter') || {}).value || '';
  var q = String((document.getElementById('attendance-search') || {}).value || '').trim().toLowerCase();
  
  var today = getTodayDateString();
  var since = today.substring(0, 8) + '01'; // "YYYY-MM-01"
  
  var virtualRows = [];
  var employeesToCheck = employeeFilter ? [DB.employees.find(function(e) { return String(e.id || '').toUpperCase() === String(employeeFilter).toUpperCase(); })].filter(Boolean) : (DB.employees || []).filter(isAttendanceTrackedEmployee);
  
  employeesToCheck.forEach(function(emp) {
    var curDate = since;
    while (curDate <= today) {
      var existing = (DB.attendance || []).find(function(a) { return String(a.employeeId || '').toUpperCase() === String(emp.id || '').toUpperCase() && (formatDateForPostgres(a.date) || a.date) === curDate; });
      
      if (existing) {
        virtualRows.push(existing);
      } else {
        var status = 'NS';
        var remarks = 'Not Submitted';
        
        // 0. Dynamic Final DCR Check
        var finalDcrExists = (DB.reports || []).some(function(r) {
          return String(r.empId || '').toUpperCase() === String(emp.id || '').toUpperCase() && 
                 (formatDateForPostgres(r.date) || r.date) === curDate &&
                 r.isFinal === true;
        });
        
        if (finalDcrExists) {
          status = 'P';
          remarks = 'Present via Final DCR Submission';
        } else {
          var activeLeave = (DB.leaves || []).find(function(l) {
            return String(l.empId || '').toUpperCase() === String(emp.id || '').toUpperCase() &&
                   (l.status === 'APPROVED' || l.status === 'APPROVED BY ADMIN') &&
                   (formatDateForPostgres(l.start) || l.start) <= curDate &&
                   (formatDateForPostgres(l.end) || l.end) >= curDate;
          });
          
          if (activeLeave) {
            var type = String(activeLeave.type || '').toLowerCase();
            status = type.indexOf('sick') !== -1 ? 'SL' : 'CL';
            remarks = type.indexOf('sick') !== -1 ? 'Approved Sick Leave' : 'Approved Casual Leave';
          } else {
            var holiday = (DB.holidays || []).find(function(h) {
              if ((formatDateForPostgres(h.date) || h.date) !== curDate) return false;
              var hState = String(h.state || '').toLowerCase().trim();
              var eState = String(emp.state || '').toLowerCase().trim();
              return hState === 'all' || hState === 'national' || hState === eState;
            });
            if (holiday) {
              status = 'H';
              remarks = holiday.name ? 'Holiday: ' + holiday.name : 'Holiday';
            } else {
              var dateObj = typeof parseLocalMidnight === 'function' ? parseLocalMidnight(curDate) : new Date(curDate + 'T00:00:00');
              if (!isNaN(dateObj.getTime())) {
                var weekday = dateObj.getDay();
                var woConfig = (DB.weeklyOffConfig || []).find(function(w) { return String(w.employee_id || '').toUpperCase() === String(emp.id || '').toUpperCase(); });
                var isOff = false;
                if (woConfig) {
                  isOff = String(woConfig.weekday) === String(weekday);
                } else {
                  isOff = weekday === 0;
                }
                if (isOff) {
                  status = 'WO';
                  remarks = 'Weekly Off';
                }
              }
            }
          }
        }
        
        if (status !== 'NS') {
          virtualRows.push({
            id: 'VIRTUAL-' + emp.id + '-' + curDate,
            employeeId: emp.id,
            date: curDate,
            attendanceStatus: status,
            remarks: remarks
          });
        }
      }
      curDate = typeof offsetDate === 'function' ? offsetDate(curDate, 1) : curDate;
      if (curDate <= since) break; // safety
    }
  });

  return virtualRows.filter(function(row) {
    if (statusFilter && row.attendanceStatus !== statusFilter) return false;
    var emp = DB.employees.find(function(e) { return String(e.id || '').toUpperCase() === String(row.employeeId || '').toUpperCase(); });
    var haystack = [
      row.employeeId || '',
      emp ? emp.name || '' : '',
      row.date || '',
      row.attendanceStatus || '',
      row.remarks || ''
    ].join(' ').toLowerCase();
    return !q || haystack.indexOf(q) !== -1;
  }).slice().sort(function(a, b) {
    var aKey = (a.date || '') + '|' + (a.employeeId || '');
    var bKey = (b.date || '') + '|' + (b.employeeId || '');
    return aKey < bKey ? 1 : -1;
  });
}`;
    c = c.replace(dashRegex, newDashLogic);
    updated = true;
  }

  if (updated) {
    fs.writeFileSync(f, c);
    console.log(f + ' updated successfully.');
  }
});
