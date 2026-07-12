const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://mmxdvruucggeixjqwsqr.supabase.co';
const supabaseKey = 'sb_publishable_2jy3q9qK_wkcnFAmPHe8dA_NEGZsRpl';

const supabase = createClient(supabaseUrl, supabaseKey, {
  global: {
    headers: {
      'x-employee-id': 'TEST02',
      'x-employee-password': 'test01'
    }
  }
});

async function run() {
  console.log('Fetching TEST01 tour plans as TEST02...');
  const { data: tpData, error: tpErr } = await supabase.from('tour_plans').select('*').eq('emp_id', 'TEST01');
  console.log('TP Data length:', tpData ? tpData.length : 0);
  if (tpErr) console.error('TP Err:', tpErr);

  if (tpData && tpData.length > 0) {
    const tp = tpData[0];
    console.log('Attempting to update status to Approved...');
    const { data: updData, error: updErr } = await supabase.from('tour_plans').upsert({
      id: tp.id,
      emp_id: tp.emp_id,
      status: 'Approved',
      approved_by: 'TEST02',
      month: tp.month,
      manager_id: tp.manager_id
    }, { onConflict: 'id' }).select();
    
    console.log('Update Data length:', updData ? updData.length : 0);
    if (updErr) console.error('Update Err:', updErr);
  }
}
run();
