const fs = require('fs');

function patchFile(file) {
  let content = fs.readFileSync(file, 'utf8');
  
  const searchRegex = /var pushPromises = myTodayReports\.map\(function\(r\) \{\s*return pushReportToSupabase\(r\)\.catch\(function\(e\) \{ console\.error\(e\); \}\);\s*\}\);/;
  if (content.match(searchRegex)) {
    const newLogic = `
  var pushPromises = myTodayReports.map(function(r) {
    return pushReportToSupabase(r).catch(function(e) { console.error(e); });
  });
  
  if (typeof upsertAttendanceRecord === 'function') {
    var existingAtt = upsertAttendanceRecord({
      employeeId: u.id,
      date: today,
      loginTime: typeof getAttendanceLoginTimeValue === 'function' ? getAttendanceLoginTimeValue(new Date()) : '',
      attendanceStatus: 'P',
      remarks: 'Present via Final DCR Submission'
    });
    
    if (typeof useSupabase !== 'undefined' && useSupabase && typeof supabase !== 'undefined' && supabase) {
      var dbAtt = {
        id: existingAtt.id,
        employee_id: existingAtt.employeeId,
        date: existingAtt.date,
        login_time: existingAtt.loginTime,
        attendance_status: existingAtt.attendanceStatus,
        remarks: existingAtt.remarks,
        created_at: existingAtt.createdAt
      };
      pushPromises.push(supabase.from('attendance').upsert(dbAtt, { onConflict: 'employee_id, date' }).select().catch(function(e){console.error(e)}));
    }
  }
`;
    content = content.replace(searchRegex, newLogic.trim());
    fs.writeFileSync(file, content);
    console.log('Patched ' + file);
  } else {
    console.log('Regex not found in ' + file);
  }
}

patchFile('index.html');
patchFile('live_index.html');
