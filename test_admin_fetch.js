require('dotenv').config(); 
const { createClient } = require('@supabase/supabase-js'); 
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY); 

async function run() { 
  // Authenticate as Admin
  const { data: { session }, error: authErr } = await supabase.auth.signInWithPassword({ email: 'ADLA100@vest.com', password: 'ADLA100' }); 
  if (authErr) { console.log('Auth error:', authErr); return; }

  let allData = [];
  let page = 0;
  const pageSize = 1000;
  while (true) {
    let query = supabase.from('reports').select('*').order('id');
    const { data, error } = await query.range(page * pageSize, (page + 1) * pageSize - 1);
    if (error) { console.log('Fetch error:', error); break; }
    if (!data || data.length === 0) break;
    allData = allData.concat(data);
    if (data.length < pageSize) break;
    page++;
  }
  
  console.log('Total reports fetched via supabase-js loop for Admin:', allData.length);
  
  const indrajitReports = allData.filter(r => r.emp_id === 'ADLA18' && r.date === '2026-07-08');
  console.log('Indrajit July 8 reports found by JS:', indrajitReports.length);
} 
run();
