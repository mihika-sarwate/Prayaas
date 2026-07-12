const fetch = require('node-fetch');
require('dotenv').config();

async function checkRest() {
  const url = process.env.SUPABASE_URL + '/rest/v1/reports?emp_id=eq.TEST01&select=*';
  const res = await fetch(url, {
    headers: {
      apikey: process.env.SUPABASE_ANON_KEY,
      Authorization: `Bearer ${process.env.SUPABASE_ANON_KEY}`
    }
  });
  const data = await res.json();
  console.log(data);
}
checkRest();
