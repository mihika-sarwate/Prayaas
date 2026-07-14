const fs = require('fs');

function patchFile(file) {
  let content = fs.readFileSync(file, 'utf8');
  
  // Notice that script_0.js has a different finalSubmitToday block structure than index.html!
  // It has a forEach over myTodayReports where it sets r.isFinal = true; pushReportToSupabase(r);
  
  const searchRegex = /myTodayReports\.forEach\(function\(r\) \{\s*r\.isFinal = true;\s*pushReportToSupabase\(r\);\s*\}\);/;
  if (content.match(searchRegex)) {
    const newLogic = `
  var pushPromises = myTodayReports.map(function(r) {
    r.isFinal = true;
    return pushReportToSupabase(r).catch(function(e) { console.error(e); });
  });
`;
    content = content.replace(searchRegex, newLogic.trim());
    
    // Also need to push attendance
    const attendanceSearch = /upsertAttendanceRecord\(\{\s*employeeId: u\.id,\s*date: today,\s*loginTime: getAttendanceLoginTimeValue\(new Date\(\)\),\s*attendanceStatus: 'P',\s*remarks: 'Present via Final DCR Submission'\s*\}\);/;
    const attendanceReplace = `
  var existingAtt = upsertAttendanceRecord({
    employeeId: u.id,
    date: today,
    loginTime: getAttendanceLoginTimeValue(new Date()),
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
`;
    content = content.replace(attendanceSearch, attendanceReplace.trim());
    
    // add Promise.all(pushPromises) right before renderHomeStats()
    content = content.replace(/renderHomeStats\(\);\s*showToast\('Final submit successful! Reports locked\.'\);/, "Promise.all(pushPromises).then(function() {\n    if (typeof syncSupabaseDatabase === 'function') syncSupabaseDatabase();\n  });\n  renderHomeStats();\n  showToast('Final submit successful! Reports locked.');");
    
    fs.writeFileSync(file, content);
    console.log('Patched ' + file);
  } else {
    console.log('Regex not found in ' + file);
  }
}

patchFile('script_0.js');
