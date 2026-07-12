require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function run() {
  const headers = {
    'x-employee-id': 'ADLA02',
    'x-employee-password': 'ADLA02'
  };
  
  const customSupabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY, {
    global: {
      headers: headers
    }
  });

  console.time('Fetch page 6');
  const { data, error } = await customSupabase
    .from('reports')
    .select('id, emp_id')
    .range(6000, 6999);
  console.timeEnd('Fetch page 6');

  if (error) {
    console.error('Fetch page 6 failed:', error);
  } else {
    console.log('Fetch page 6 succeeded, length:', data.length);
  }
}

run().catch(console.error);
