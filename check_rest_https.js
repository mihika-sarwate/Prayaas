const https = require('https');
require('dotenv').config();

const url = new URL(process.env.SUPABASE_URL + '/rest/v1/reports?emp_id=eq.TEST01&select=*');
const options = {
  headers: {
    'apikey': process.env.SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY}`
  }
};

https.get(url, options, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log(data));
}).on('error', err => console.error(err));
