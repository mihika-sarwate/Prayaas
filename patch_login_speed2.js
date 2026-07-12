const fs = require('fs');

const files = ['index.html', 'script_0.js', 'test_script_0.js'];

const newBlock = `const [
      doctors, chemists, reports, tourPlans, expenses, leaves, sfc,
      samplesInv, giftsInv, inputsInv, stockists, announcements,
      attendanceData, weeklyOffData, holData
    ] = await Promise.all([
      fetchAllFromSupabase('doctors'),
      fetchAllFromSupabase('chemists'),
      fetchAllFromSupabase('reports', scopedByEmployee('emp_id', { select: REPORTS_SELECT_CLAUSE })),
      fetchAllFromSupabase('tour_plans', scopedByEmployee('emp_id')),
      fetchAllFromSupabase('expenses', scopedByEmployee('emp_id')),
      fetchAllFromSupabase('leaves', scopedByEmployee('emp_id')),
      fetchAllFromSupabase('sfc'),
      fetchAllFromSupabase('samples_inventory', scopedByEmployee('emp_id')),
      fetchAllFromSupabase('gifts_inventory', scopedByEmployee('emp_id')),
      fetchAllFromSupabase('inputs_inventory', scopedByEmployee('emp_id')),
      fetchAllFromSupabase('stockists'),
      fetchAllFromSupabase('announcements', { allowMissing: true }),
      fetchAllFromSupabase('attendance', scopedByEmployee('employee_id', { allowMissing: true })),
      fetchAllFromSupabase('weekly_off_config', scopedByEmployee('employee_id', { allowMissing: true })),
      fetchAllFromSupabase('holidays', { allowMissing: true })
    ]);`;

files.forEach(f => {
  if (fs.existsSync(f)) {
    let c = fs.readFileSync(f, 'utf8');
    const start = c.indexOf("const doctors = await fetchAllFromSupabase('doctors');");
    const end = c.indexOf("const holData = await fetchAllFromSupabase('holidays', { allowMissing: true });");
    
    if (start !== -1 && end !== -1) {
      const oldBlock = c.substring(start, end + 79);
      c = c.replace(oldBlock, newBlock);
      fs.writeFileSync(f, c);
      console.log('Successfully patched ' + f);
    }
  }
});
