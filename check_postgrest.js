const https = require('https');
const url = 'https://hmdyckndmndwovpxoixd.supabase.co/rest/v1/reports?emp_id=eq.ADLA18&date=eq.2026-07-09&select=id,date';
const options = {
  headers: {
    'apikey': process.env.SUPABASE_KEY,
    'Authorization': 'Bearer ' + process.env.SUPABASE_KEY
  }
};
https.get(url, options, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log(data));
}).on('error', console.error);
