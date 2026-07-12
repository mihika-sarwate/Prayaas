const fs = require('fs');

const files = ['index.html', 'script_0.js', 'test_script_0.js'];

const oldBlock = `    const doctors = await fetchAllFromSupabase('doctors');
    const chemists = await fetchAllFromSupabase('chemists');
    const reports = await fetchAllFromSupabase('reports', scopedByEmployee('emp_id', { select: REPORTS_SELECT_CLAUSE }));
    const tourPlans = await fetchAllFromSupabase('tour_plans', scopedByEmployee('emp_id'));
    const expenses = await fetchAllFromSupabase('expenses', scopedByEmployee('emp_id'));
    const leaves = await fetchAllFromSupabase('leaves', scopedByEmployee('emp_id'));
    const sfc = await fetchAllFromSupabase('sfc');
    const samplesInv = await fetchAllFromSupabase('samples_inventory', scopedByEmployee('emp_id'));
    const giftsInv = await fetchAllFromSupabase('gifts_inventory', scopedByEmployee('emp_id'));
    const inputsInv = await fetchAllFromSupabase('inputs_inventory', scopedByEmployee('emp_id'));
    const stockists = await fetchAllFromSupabase('stockists');
    const announcements = await fetchAllFromSupabase('announcements', { allowMissing: true });
    const attendanceData = await fetchAllFromSupabase('attendance', scopedByEmployee('employee_id', { allowMissing: true }));
    const weeklyOffData = await fetchAllFromSupabase('weekly_off_config', scopedByEmployee('employee_id', { allowMissing: true }));

    const holData = await fetchAllFromSupabase('holidays', { allowMissing: true });`;

const newBlock = `    const [
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
    
    // Normalize newlines for both oldBlock and file content to make replacement easier
    const normalizedOld = oldBlock.replace(/\\r\\n/g, '\\n');
    let normalizedC = c.replace(/\\r\\n/g, '\\n');
    
    if (normalizedC.includes(normalizedOld)) {
      normalizedC = normalizedC.replace(normalizedOld, newBlock);
      
      // If original file used CRLF, convert back (optional, but good for preserving line endings)
      if (c.includes('\\r\\n')) {
        normalizedC = normalizedC.replace(/\\n/g, '\\r\\n');
      }
      
      fs.writeFileSync(f, normalizedC);
      console.log('Patched sequential awaits in ' + f);
    } else {
      console.log('Block not found in ' + f);
    }
  }
});
