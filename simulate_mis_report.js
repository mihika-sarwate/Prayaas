const { Client } = require('pg'); 
const client = new Client({connectionString: 'postgresql://postgres.mmxdvruucggeixjqwsqr:Adonisgroma%402026@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres'}); 
async function run() { 
  await client.connect(); 
  const res = await client.query("SELECT * FROM reports WHERE emp_id = 'ADLA18'"); 
  let reports = res.rows.map(r => {
    return {
      id: r.id,
      empId: r.emp_id,
      date: r.date ? String(r.date.toISOString()).substring(0, 10) : null,
      targetType: r.target_type
    };
  });
  
  const from = '2026-07-09';
  const to = '2026-07-09';
  const empId = 'ADLA18';
  
  let baseReports = reports.filter(function(r){
    if(empId && r.empId !== empId) return false;
    if(from && r.date < from) return false;
    if(to && r.date > to) return false;
    return true;
  });
  
  let docCalls = baseReports.filter(function(r){return r.targetType === 'Doctor';});
  console.log("Filtered base reports count:", baseReports.length);
  console.log("Filtered doc calls count:", docCalls.length);
  
  await client.end(); 
} 
run().catch(console.error);
