const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf-8');

// 1. dbEmps in syncSupabaseDatabase
const old_dbEmps = `      const dbEmps = DB.employees.map(function(e) {
        var managerId = e.managerId || null;
        if (managerId && !DB.employees.find(function(x) { return x.id === managerId; })) {
          managerId = null;
        }
        return {
          id: e.id,
          name: e.name,
          pwd: e.pwd,
          area: e.area,
          role: e.role,
          manager_id: managerId,
          doj: formatDateForPostgres(e.doj),
          state: e.state || null,
          status: normalizeEmployeeStatus(e.status),
          designation: typeof e.designation !== 'undefined' ? (e.designation || '').trim() : getDefaultEmployeeDesignation(e.role),
          leaves: e.leaves ? Object.assign({}, e.leaves, { _designation: typeof e.designation !== 'undefined' ? (e.designation || '').trim() : getDefaultEmployeeDesignation(e.role) }) : {}
        };
      });`;
const new_dbEmps = `      const dbEmps = DB.employees.map(function(e) {
        var managerId = e.managerId || null;
        if (managerId && !DB.employees.find(function(x) { return x.id === managerId; })) {
          managerId = null;
        }
        return {
          id: e.id || undefined,
          name: e.name || '',
          pwd: e.pwd || '',
          area: e.area || '',
          role: e.role || '',
          manager_id: managerId,
          doj: formatDateForPostgres(e.doj) || null,
          state: e.state || null,
          status: normalizeEmployeeStatus(e.status),
          designation: typeof e.designation !== 'undefined' ? (e.designation || '').trim() : getDefaultEmployeeDesignation(e.role),
          leaves: e.leaves ? Object.assign({}, e.leaves, { _designation: typeof e.designation !== 'undefined' ? (e.designation || '').trim() : getDefaultEmployeeDesignation(e.role) }) : {}
        };
      });`;
content = content.replace(old_dbEmps, new_dbEmps);

// 2. DEFAULT_DB dbEmps in initSupabaseData
const old_def_emps = `    const dbEmps = DEFAULT_DB.employees.map(function(e) {
      var managerId = e.managerId || null;
      if (managerId && !DEFAULT_DB.employees.find(function(x) { return x.id === managerId; })) {
        managerId = null;
      }
      return {
        id: e.id,
        name: e.name,
        pwd: e.pwd,
        area: e.area,
        role: e.role,
        manager_id: managerId,
        doj: formatDateForPostgres(e.doj),
        state: e.state || null,
        status: normalizeEmployeeStatus(e.status),
        designation: typeof e.designation !== 'undefined' ? (e.designation || '').trim() : getDefaultEmployeeDesignation(e.role),
        leaves: Object.assign({}, e.leaves || {CL:12,SL:10,EL:15,LWP:99,CL_used:0,SL_used:0,EL_used:0,LWP_used:0}, { _designation: typeof e.designation !== 'undefined' ? (e.designation || '').trim() : getDefaultEmployeeDesignation(e.role) })
      };
    });`;
const new_def_emps = `    const dbEmps = DEFAULT_DB.employees.map(function(e) {
      var managerId = e.managerId || null;
      if (managerId && !DEFAULT_DB.employees.find(function(x) { return x.id === managerId; })) {
        managerId = null;
      }
      return {
        id: e.id || undefined,
        name: e.name || '',
        pwd: e.pwd || '',
        area: e.area || '',
        role: e.role || '',
        manager_id: managerId,
        doj: formatDateForPostgres(e.doj) || null,
        state: e.state || null,
        status: normalizeEmployeeStatus(e.status),
        designation: typeof e.designation !== 'undefined' ? (e.designation || '').trim() : getDefaultEmployeeDesignation(e.role),
        leaves: Object.assign({}, e.leaves || {CL:12,SL:10,EL:15,LWP:99,CL_used:0,SL_used:0,EL_used:0,LWP_used:0}, { _designation: typeof e.designation !== 'undefined' ? (e.designation || '').trim() : getDefaultEmployeeDesignation(e.role) })
      };
    });`;
content = content.replace(old_def_emps, new_def_emps);

// 3. dbLeaves
const old_leaves = `      const dbLeaves = DB.leaves.map(lv => ({
        id: lv.id,
        emp_id: lv.empId,
        emp_name: lv.empName,
        type: lv.type,
        start: formatDateForPostgres(lv.start),
        "end": formatDateForPostgres(lv.end),
        days: lv.days,
        reason: lv.reason || null,
        manager_id: lv.managerId || null,
        status: lv.status,
        submitted_at: lv.submittedAt || null,
        remarks: lv.remarks || null
      }));`;
const new_leaves = `      const dbLeaves = DB.leaves.map(lv => ({
        id: lv.id || undefined,
        emp_id: lv.empId || '',
        emp_name: lv.empName || '',
        type: lv.type || '',
        start: formatDateForPostgres(lv.start) || null,
        "end": formatDateForPostgres(lv.end) || null,
        days: lv.days || 0,
        reason: lv.reason || null,
        manager_id: lv.managerId || null,
        status: lv.status || 'pending',
        submitted_at: lv.submittedAt || null,
        remarks: lv.remarks || null
      }));`;
content = content.replace(old_leaves, new_leaves);

// 4. dbTourPlans
const old_tp = `      const dbTourPlans = DB.tourPlans.map(tp => ({
        id: tp.id,
        emp_id: tp.empId,
        emp_name: tp.empName,
        month: tp.month,
        year: tp.year,
        manager_id: resolveManagerId(tp.managerId),
        days: tp.days,
        status: tp.status,
        submitted_at: tp.submittedAt || null,
        approved_date: formatDateForPostgres(tp.approvedDate),
        approved_by: tp.approvedBy || null,
        revision_history: tp.revisionHistory || []
      }));`;
const new_tp = `      const dbTourPlans = DB.tourPlans.map(tp => ({
        id: tp.id || undefined,
        emp_id: tp.empId || '',
        emp_name: tp.empName || '',
        month: tp.month || '',
        year: tp.year || 0,
        manager_id: resolveManagerId(tp.managerId),
        days: JSON.stringify(tp.days || []),
        status: tp.status || 'draft',
        submitted_at: tp.submittedAt || null,
        approved_date: formatDateForPostgres(tp.approvedDate) || null,
        approved_by: tp.approvedBy || null,
        revision_history: JSON.stringify(tp.revisionHistory || [])
      }));`;
content = content.replace(old_tp, new_tp);

// 5. dbExpenses
const old_exp = `      const dbExpenses = DB.expenses.map(ex => ({
        id: ex.id,
        emp_id: ex.empId,
        emp_name: ex.empName,
        month: ex.month,
        manager_id: resolveManagerId(ex.managerId),
        lines: ex.lines,
        total: ex.total,
        receipt_file: ex.receiptFile || null,
        status: ex.status,
        submitted_at: ex.submittedAt || null,
        remarks: ex.remarks || null
      }));`;
const new_exp = `      const dbExpenses = DB.expenses.map(ex => ({
        id: ex.id || undefined,
        emp_id: ex.empId || '',
        emp_name: ex.empName || '',
        month: ex.month || '',
        manager_id: resolveManagerId(ex.managerId),
        lines: JSON.stringify(ex.lines || []),
        total: ex.total || 0,
        receipt_file: ex.receiptFile || null,
        status: ex.status || 'draft',
        submitted_at: ex.submittedAt || null,
        remarks: ex.remarks || null
      }));`;
content = content.replace(old_exp, new_exp);

// 6. dbSfc
const old_sfc = `      const dbSfc = DB.sfc.map(s => ({
        id: s.id || undefined,
        from_loc: s.from,
        to_loc: s.to,
        distance: s.distance || 0,
        mode: JSON.stringify({ mode: s.mode, empId: s.empId, workingDays: s.workingDays, empName: s.empName, hq: s.hq, state: s.state, category: s.category, total: s.total, doctors: s.doctors, business: s.business }),
        fare: s.fare || 0,
        da: s.da || 0,
        lodge: 0,
        other: 0
      }));`;
const new_sfc = `      const dbSfc = DB.sfc.map(s => ({
        id: s.id || undefined,
        from_loc: s.from || '',
        to_loc: s.to || '',
        distance: s.distance || 0,
        mode: JSON.stringify({ mode: s.mode||'', empId: s.empId||'', workingDays: s.workingDays||'', empName: s.empName||'', hq: s.hq||'', state: s.state||'', category: s.category||'', total: s.total||0, doctors: s.doctors||'', business: s.business||'' }),
        fare: s.fare || 0,
        da: s.da || 0,
        lodge: 0,
        other: 0
      }));`;
content = content.replace(old_sfc, new_sfc);

// 7. dbDocs
const old_docs = `        return {
          id: d.id || undefined,
          doc_name: d.docName,
          qual: d.qual,
          specialty: d.specialty,
          address: d.address,
          hospital: d.hospital,
          category: d.category,
          hq: d.hq,
          state: d.state,
          emp_id: d.empId,
          emp_name: d.empName,
          mobile: d.mobile || null,
          email: d.email || null,
          dob: d.dob || null,
          doa: d.doa || null
        };`;
const new_docs = `        return {
          id: d.id || undefined,
          doc_name: d.docName || '',
          qual: d.qual || '',
          specialty: d.specialty || '',
          address: d.address || '',
          hospital: d.hospital || '',
          category: d.category || '',
          hq: d.hq || '',
          state: d.state || '',
          emp_id: d.empId || '',
          emp_name: d.empName || '',
          mobile: d.mobile || null,
          email: d.email || null,
          dob: d.dob || null,
          doa: d.doa || null
        };`;
content = content.replace(old_docs, new_docs);

// 8. dbChems
const old_chems = `        return {
          id: c.id || undefined,
          chemist_name: c.chemistName,
          contact_person: c.contactPerson,
          address: c.address,
          category: c.category,
          hq: c.hq,
          state: c.state,
          emp_id: c.empId,
          emp_name: c.empName,
          mobile: c.mobile || null,
          email: c.email || null,
          dob: c.dob || null,
          doa: c.doa || null
        };`;
const new_chems = `        return {
          id: c.id || undefined,
          chemist_name: c.chemistName || '',
          contact_person: c.contactPerson || '',
          address: c.address || '',
          category: c.category || '',
          hq: c.hq || '',
          state: c.state || '',
          emp_id: c.empId || '',
          emp_name: c.empName || '',
          mobile: c.mobile || null,
          email: c.email || null,
          dob: c.dob || null,
          doa: c.doa || null
        };`;
content = content.replace(old_chems, new_chems);

// 9. dbStockists
const old_stockists = `        return {
          id: s.id || undefined,
          stockist_name: s.stockistName,
          contact_person: s.contactPerson,
          address: s.address,
          hq: s.hq,
          state: s.state,
          emp_id: s.empId,
          emp_name: s.empName,
          mobile: s.mobile || null,
          email: s.email || null,
          dob: s.dob || null,
          doa: s.doa || null
        };`;
const new_stockists = `        return {
          id: s.id || undefined,
          stockist_name: s.stockistName || '',
          contact_person: s.contactPerson || '',
          address: s.address || '',
          hq: s.hq || '',
          state: s.state || '',
          emp_id: s.empId || '',
          emp_name: s.empName || '',
          mobile: s.mobile || null,
          email: s.email || null,
          dob: s.dob || null,
          doa: s.doa || null
        };`;
content = content.replace(old_stockists, new_stockists);

// 10. dbSamples
const old_samples = `      const dbSamples = DB.samplesInventory.map(s => ({
        id: s.id || undefined,
        prod_name: s.prodName,
        emp_id: s.empId,
        opening: s.opening,
        received: s.received,
        distributed: s.distributed,
        balance: s.balance
      }));`;
const new_samples = `      const dbSamples = DB.samplesInventory.map(s => ({
        id: s.id || undefined,
        prod_name: s.prodName || '',
        emp_id: s.empId || '',
        opening: s.opening || 0,
        received: s.received || 0,
        distributed: s.distributed || 0,
        balance: s.balance || 0
      }));`;
content = content.replace(old_samples, new_samples);

// 11. dbInputs
const old_inputs = `      const dbInputs = DB.inputsInventory.map(i => ({
        id: i.id || undefined,
        input_name: i.inputName,
        emp_id: i.empId,
        opening: i.opening,
        received: i.received,
        distributed: i.distributed,
        balance: i.balance
      }));`;
const new_inputs = `      const dbInputs = DB.inputsInventory.map(i => ({
        id: i.id || undefined,
        input_name: i.inputName || '',
        emp_id: i.empId || '',
        opening: i.opening || 0,
        received: i.received || 0,
        distributed: i.distributed || 0,
        balance: i.balance || 0
      }));`;
content = content.replace(old_inputs, new_inputs);

fs.writeFileSync('index.html', content);
console.log("Replaced successfully!");
