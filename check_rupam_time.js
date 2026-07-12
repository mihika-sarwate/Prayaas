require('dotenv').config();
const { Client } = require('pg');

async function run() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  const empRes = await client.query(`SELECT id, name FROM employees WHERE name ILIKE '%rupam malik%'`);
  
  if (empRes.rows.length === 0) {
    console.log("Employee Rupam Malik not found.");
    await client.end();
    return;
  }
  
  const empId = empRes.rows[0].id;
  const empName = empRes.rows[0].name;
  console.log(`Found employee: ${empName} (${empId})`);

  const date = '2026-07-11';
  
  const res = await client.query(`
    SELECT id, created_at, remarks 
    FROM reports 
    WHERE emp_id = $1 AND date = $2
    ORDER BY created_at ASC
  `, [empId, date]);
  
  if (res.rows.length === 0) {
    console.log(`No reports found for ${empName} on ${date}`);
  } else {
    for (const r of res.rows) {
      const dateObj = new Date(r.created_at);
      const istTime = dateObj.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', hour12: false });
      let isFinal = false;
      let finalSubmitTime = 'N/A';
      let docName = 'Unknown';
      try {
        const parts = r.remarks.split('\\n===METADATA===\\n');
        if (parts.length > 1) {
          const meta = JSON.parse(parts[1]);
          if (meta.isFinal === true) {
            isFinal = true;
          }
          if (meta.timestamp) {
             const tsDate = new Date(meta.timestamp);
             finalSubmitTime = tsDate.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', hour12: false });
          }
        }
        
        // Extract Doctor name from the first part of remarks if it exists, roughly
        const rLines = parts[0].split('\\n');
        for (const line of rLines) {
           if (line.toLowerCase().includes('doctor:') || line.toLowerCase().includes('name:')) {
             docName = line;
           }
        }
      } catch (e) {}
      
      console.log(`Report ID: ${r.id} | Draft Saved At (IST): ${istTime} | Final Submit Meta: ${finalSubmitTime} | isFinal: ${isFinal}`);
    }
  }

  await client.end();
}
run();
