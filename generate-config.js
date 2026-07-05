const fs = require('fs');
const path = require('path');

let envUrl = process.env.SUPABASE_URL || '';
let envKey = process.env.SUPABASE_KEY || '';

try {
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const urlMatch = envContent.match(/SUPABASE_URL=(.*)/);
    const keyMatch = envContent.match(/SUPABASE_KEY=(.*)/);
    if (urlMatch) envUrl = urlMatch[1].trim();
    if (keyMatch) envKey = keyMatch[1].trim();
  }
} catch (e) {}

const url = envUrl;
const key = envKey;

const content = `// Generated dynamically during Vercel build
window.SUPABASE_CONFIG = {
  supabaseUrl: '${url}',
  supabaseKey: '${key}'
};
`;

fs.writeFileSync('config.js', content);
console.log('config.js generated successfully from Environment Variables.');
