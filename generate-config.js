const fs = require('fs');

const url = process.env.SUPABASE_URL || '';
const key = process.env.SUPABASE_KEY || '';

const content = `// Generated dynamically during Vercel build
window.SUPABASE_CONFIG = {
  supabaseUrl: '${url}',
  supabaseKey: '${key}'
};
`;

fs.writeFileSync('config.js', content);
console.log('config.js generated successfully from Environment Variables.');
