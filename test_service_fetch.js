require('dotenv').config(); 
const { createClient } = require('@supabase/supabase-js'); 
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY); 

async function run() { 
  const { data, error } = await supabase.from('reports').select('id, date, emp_id').eq('emp_id', 'ADLA18').eq('date', '2026-07-08');
  if (error) { console.log('Fetch error:', error); return; }
  console.log('Fetched:', data);
} 
run();
