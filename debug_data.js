require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY, {
  global: { headers: { 'x-employee-id': 'ADMIN', 'x-employee-password': 'adonis@1234' } }
});

async function run() {
  const { data: emps } = await supabase.from('employees').select('id, status').in('id', ['ADLA81', 'ADLA128', 'TEST01']);
  console.log("Employees:", emps);

  const { data: att } = await supabase.from('attendance').select('employee_id, date, attendance_status').in('employee_id', ['ADLA81', 'ADLA128', 'TEST01']).gte('date', '2026-07-10');
  console.log("Attendance:", att);

  const { data: reps } = await supabase.from('reports').select('emp_id, date').in('emp_id', ['ADLA81', 'ADLA128', 'TEST01']).gte('date', '2026-07-10');
  console.log("Reports:", reps);
}

run();
