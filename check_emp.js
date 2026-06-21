const https = require('https');
const options = {
  hostname: 'ajifnoazcvxvpyzlusuy.supabase.co',
  path: '/rest/v1/employees?select=id&id=eq.ADLA33',
  headers: {
    'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFqaWZub2F6Y3Z4dnB5emx1c3V5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDgyMDk5OSwiZXhwIjoyMDk2Mzk2OTk5fQ.ZWKocTrU_DzgXkOpi1M4oOl7oF4WobCIQmM99rzCW2U',
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFqaWZub2F6Y3Z4dnB5emx1c3V5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDgyMDk5OSwiZXhwIjoyMDk2Mzk2OTk5fQ.ZWKocTrU_DzgXkOpi1M4oOl7oF4WobCIQmM99rzCW2U'
  }
};
https.get(options, (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => console.log('Exact ADLA33 match:', data));
});
const opt2 = { ...options, path: '/rest/v1/employees?select=id&id=ilike.%25ADLA33%25' };
https.get(opt2, (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => console.log('ILIKE ADLA33 match:', data));
});
