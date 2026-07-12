const fs = require('fs');

const f = 'live_index.html';
if (!fs.existsSync(f)) return;
let c = fs.readFileSync(f, 'utf8');

// The minified version might look like:
// const doctors=await fetchAllFromSupabase('doctors');const chemists=await fetchAllFromSupabase('chemists');...
// Let's use a regex to match it.

const regex = /const ([a-zA-Z0-9_]+)\s*=\s*await fetchAllFromSupabase\('doctors'\);[\s\S]*?const ([a-zA-Z0-9_]+)\s*=\s*await fetchAllFromSupabase\('holidays',\s*\{\s*allowMissing:\s*true\s*\}\);/;

const match = c.match(regex);
if (match) {
  const oldBlock = match[0];
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
  c = c.replace(oldBlock, newBlock);
  fs.writeFileSync(f, c);
  console.log('Successfully patched live_index.html with regex');
} else {
  console.log('Regex did not match in live_index.html');
}
