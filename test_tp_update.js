const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://mmxdvruucggeixjqwsqr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1teGR2cnV1Y2dnZWl4anF3c3FyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTY4ODg3OTEsImV4cCI6MjAzMjQ2NDc5MX0.zF1_4kK1-Q9F-W3P_oYcWpM6_1V4LzG_L2uL5_r5D9E';

const supabase = createClient(supabaseUrl, supabaseKey, {
  global: {
    headers: {
      'x-employee-id': 'ADLA02',
      'x-employee-password': 'ADLA02'
    }
  }
});

async function run() {
  console.log('Fetching TEST01 tour plans...');
  const { data: tpData, error: tpErr } = await supabase.from('tour_plans').select('*').eq('emp_id', 'TEST01');
  console.log('TP Data:', tpData);
  if (tpErr) console.error('TP Err:', tpErr);

  if (tpData && tpData.length > 0) {
    const tp = tpData[0];
    console.log('Attempting to update status to Approved...');
    const { data: updData, error: updErr } = await supabase.from('tour_plans').upsert({
      id: tp.id,
      emp_id: tp.emp_id,
      status: 'Approved',
      approved_by: 'ADLA02',
      month: tp.month,
      manager_id: tp.manager_id
    }, { onConflict: 'id' }).select();
    
    console.log('Update Data:', updData);
    if (updErr) console.error('Update Err:', updErr);
  }
}
run();
