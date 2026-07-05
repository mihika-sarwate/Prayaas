const fs = require('fs');
const path = require('path');

let envUrl = 'https://mmxdvruucggeixjqwsqr.supabase.co';
let envKey = 'sb_publishable_2jy3q9qK_wkcnFAmPHe8dA_NEGZsRpl';

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
