const fs = require('fs');
const path = require('path');

// 1. Create public directory
const distDir = path.join(__dirname, 'public');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir);
}

// 2. Files to copy
const filesToCopy = [
  'index.html',
  'live_index.html',
  'supabase.js',
  'logo.jpg',
  'chemist_master_template (1).csv',
  'inventory_bulk_upload_template (2).csv',
  'sfc_distance_template (4).csv',
  'stockist_master_template (1).csv'
];

filesToCopy.forEach(file => {
  const src = path.join(__dirname, file);
  const dest = path.join(distDir, file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    console.log(`Copied ${file} to public/`);
  } else {
    console.warn(`Warning: File ${file} not found.`);
  }
});

// 3. Generate config.js inside public directory
const url = process.env.SUPABASE_URL || '';
const key = process.env.SUPABASE_KEY || '';

const content = `// Generated dynamically during build
window.SUPABASE_CONFIG = {
  supabaseUrl: '${url}',
  supabaseKey: '${key}'
};
`;

fs.writeFileSync(path.join(distDir, 'config.js'), content);
console.log('Generated public/config.js successfully.');
