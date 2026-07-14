require('dotenv').config();

const req = {
  method: 'GET',
  headers: { 'x-vercel-cron': '1' },
  query: { date: '2026-07-13' } // No dryRun!
};

const res = {
  status: function(code) {
    this.statusCode = code;
    return this;
  },
  json: function(data) {
    console.log('Status:', this.statusCode);
    console.log('Response:', JSON.stringify(data, null, 2));
  }
};

const handler = require('./api/attendance-midnight.js');

handler(req, res).catch(console.error);
