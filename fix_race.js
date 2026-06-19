const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// 1. Fix race condition in initSupabaseData
const initTarget = `      if (holData && holData.length > 0) {
        setHolidayDeletionFlag(false);
        setHolidayTableMissingFlag(false);
        holidays = holData.map(h => ({ date: h.date, name: h.name, state: h.state || 'All' }));
      } else {
        holidays = getHolidayDeletionFlag() ? [] : (DB.holidays || DEFAULT_DB.holidays || []);
      }
      
      if (!emps || emps.length === 0) {
        if (isSilent !== true) showToast("Seeding database with default records...");
        await seedSupabaseDatabase();
        await initSupabaseData(isSilent);
        return;
      }
      
      DB = {`;

const initReplacement = `      if (holData && holData.length > 0) {
        setHolidayDeletionFlag(false);
        setHolidayTableMissingFlag(false);
        holidays = holData.map(h => ({ date: h.date, name: h.name, state: h.state || 'All' }));
      } else {
        holidays = getHolidayDeletionFlag() ? [] : (DB.holidays || DEFAULT_DB.holidays || []);
      }
      
      if (!emps || emps.length === 0) {
        if (isSilent !== true) showToast("Seeding database with default records...");
        await seedSupabaseDatabase();
        await initSupabaseData(isSilent);
        return;
      }
      
      if (isSyncing || syncPending) {
        console.warn("initSupabaseData aborting DB overwrite because a sync is running/pending.");
        return;
      }
      
      DB = {`;

html = html.replace(initTarget, initReplacement);

// 2. Fix designation mapping in syncSupabaseDatabase
const syncTarget = `      const dbEmps = DB.employees.map(function(e) {
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
          designation: (e.designation || '').trim() || getDefaultEmployeeDesignation(e.role),
          leaves: e.leaves
        };
      });`;

const syncReplacement = `      const dbEmps = DB.employees.map(function(e) {
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
          leaves: e.leaves
        };
      });`;

html = html.replace(syncTarget, syncReplacement);

fs.writeFileSync('index.html', html, 'utf8');
console.log("Done");
