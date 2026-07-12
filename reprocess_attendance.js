require('dotenv').config();
const { Client } = require('pg');
const handler = require('./api/attendance-midnight.js');

async function run() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  
  // Unblock all employees first so we have a clean slate
  console.log("Unblocking all employees...");
  await client.query(`
    UPDATE employees 
    SET account_status = 'ACTIVE', 
        blocked_date = NULL, 
        blocked_reason = NULL
  `);
  
  await client.end();

  // Run attendance calculation for 2026-07-09
  console.log("Reprocessing attendance for 2026-07-09...");
  const req = {
    method: 'POST',
    headers: {
      'x-vercel-cron': '1'
    },
    query: {
      date: '2026-07-09'
    }
  };

  const res = {
    status: function(code) {
      console.log('Status:', code);
      return this;
    },
    json: function(data) {
      console.log('Response JSON:', data);
    }
  };

  await handler(req, res);
  console.log('Done');
}

run().catch(console.error);
