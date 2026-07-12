require('dotenv').config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

async function testFetch() {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/employees?select=id,name,manager_id`, {
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'x-employee-id': 'ADLA02',
      'x-employee-password': 'ADLA02'
    }
  });
  const data = await res.json();
  console.log('Status:', res.status);
  console.log('Data length:', data.length);
  if (data.length > 0) {
    console.log('First 3:', data.slice(0, 3));
  } else {
    console.log('Response:', data);
  }
}

testFetch();
