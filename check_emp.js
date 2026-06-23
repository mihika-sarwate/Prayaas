const https = require('https');
const fs = require('fs');
const path = require('path');

function loadEnv() {
  try {
    const envPath = path.resolve(__dirname, '.env');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      envContent.split(/\r?\n/).forEach(line => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
          const firstEqual = trimmed.indexOf('=');
          if (firstEqual !== -1) {
            const key = trimmed.slice(0, firstEqual).trim();
            const val = trimmed.slice(firstEqual + 1).trim();
            process.env[key] = val;
          }
        }
      });
    }
  } catch (err) {
    console.error("Warning: Could not load .env file", err);
  }
}
loadEnv();

const supabaseUrl = process.env.SUPABASE_URL || 'https://bydkgooulktqjgojqzod.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || '';
const hostname = new URL(supabaseUrl).hostname;

const options = {
  hostname: hostname,
  path: '/rest/v1/employees?select=id&id=eq.ADLA33',
  headers: {
    'apikey': supabaseKey,
    'Authorization': 'Bearer ' + supabaseKey
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
