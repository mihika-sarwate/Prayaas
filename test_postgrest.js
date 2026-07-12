require('dotenv').config(); 

async function run() {
  const url = process.env.SUPABASE_URL + "/rest/v1/reports?emp_id=eq.ADLA18&date=eq.2026-07-08&select=id,date&limit=5";
  const res = await fetch(url, {
    headers: {
      "apikey": process.env.SUPABASE_SERVICE_ROLE_KEY,
      "Authorization": "Bearer " + process.env.SUPABASE_SERVICE_ROLE_KEY
    }
  });
  const data = await res.json();
  console.log(data);
}
run();
