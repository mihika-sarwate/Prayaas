function initSupabaseData(isSilent) {
  if (typeof SESSION === 'undefined' || !SESSION || !SESSION.user) {
    console.log("No active session found. Deferring Supabase data fetch until login.");
    isLoadingData = false;
    var scrLogin = document.getElementById('scr-login');
    if (scrLogin) scrLogin.style.display = 'block';
    return;
  }
  
  // Re-initialize Supabase client with current session headers
  initSupabaseClient();

  if (isLoadingData) {
    console.log("initSupabaseData ignored because load is already in progress.");
    return;
  }
  isLoadingData = true; // Set immediately so restoreSessionWhenReady always waits

  if (!hasInitializedData) {
    try {
      await loadLocalDB();
    } catch(e) {
      console.error("Initial loadLocalDB failed:", e);
    }
  }

  if (window._supabaseLoadTimeout) clearTimeout(window._supabaseLoadTimeout);
  var timeoutMs = (navigator.onLine === false) ? 500 : 20000;
  window._supabaseLoadTimeout = setTimeout(async function() {
    if (isLoadingData && !hasInitializedData) {
      console.warn("Supabase load timed out (" + (timeoutMs/1000) + "s). Falling back to LocalStorage.");
      if (isSilent !== true) {
        showToast("Offline mode: Using local database cache.");
      }
      try {
        await loadLocalDB();
        var indicator = document.getElementById('db-status-indicator');
        if (indicator) indicator.textContent = 'Database Connection: Offline Mode (Cached)';
      } catch (e) {
        console.error("loadLocalDB failed during timeout:", e);
      } finally {
        isLoadingData = false;
      }
    }
  }, timeoutMs);

  if (!supabase) {
    if (window._hasAttemptedSupabaseLoad) {
      console.warn("Supabase load already attempted. Using local database.");
      try {
        await loadLocalDB();
        var indicator = document.getElementById('db-status-indicator');
        if (indicator) indicator.textContent = 'Database Connection: Offline Mode (Cached)';
      } catch (e) {
        console.error("loadLocalDB failed after load attempt:", e);
      } finally {
        isLoadingData = false;
      }
      return;
    }
    window._hasAttemptedSupabaseLoad = true;
    ensureSupabaseLoaded(async function() {
      isLoadingData = false; // release so the next initSupabaseData call can proceed
      if (supabase) {
        await initSupabaseData(isSilent);
      } else {
        console.warn("Supabase library not loaded. Using LocalStorage.");
        isLoadingData = true;
        try {
          await loadLocalDB();
          var indicator = document.getElementById('db-status-indicator');
          if (indicator) indicator.textContent = 'Database Connection: Offline Mode (Cached)';
        } catch (e) {
          console.error("loadLocalDB failed after script loading:", e);
        } finally {
          isLoadingData = false;
        }
      }
    });
    return; // isLoadingData stays true while Supabase JS is loading
  }
  
  isLoadingData = true;
  var statusEl = document.getElementById('db-status-indicator');
  if (statusEl && isSilent !== true) statusEl.textContent = 'Connecting to server, please wait...';
  if (isSilent !== true) showToast("Connecting to Supabase...");
  
  try {
    const emps = await fetchAllFromSupabase('employees', { select: 'id, name, area, role, manager_id, doj, state, status, account_status, blocked_date, blocked_reason, designation, leaves' });
    
    const doctors = await fetchAllFromSupabase('doctors');
    const chemists = await fetchAllFromSupabase('chemists');
    const reports = await fetchAllFromSupabase('reports');
    const tourPlans = await fetchAllFromSupabase('tour_plans');
    const expenses = await fetchAllFromSupabase('expenses');
    const leaves = await fetchAllFromSupabase('leaves');
    const sfc = await fetchAllFromSupabase('sfc');
    const samplesInv = await fetchAllFromSupabase('samples_inventory');
    const giftsInv = await fetchAllFromSupabase('gifts_inventory');
    const inputsInv = await fetchAllFromSupabase('inputs_inventory');
    const stockists = await fetchAllFromSupabase('stockists');
    const announcements = await fetchAllFromSupabase('announcements', { allowMissing: true });
    const attendanceData = await fetchAllFromSupabase('attendance', { allowMissing: true });
    const weeklyOffData = await fetchAllFromSupabase('weekly_off_config', { allowMissing: true });

    const holData = await fetchAllFromSupabase('holidays', { allowMissing: true });
    
    useSupabase = true;
    console.log("Connected to Supabase successfully.");
    var indicator = document.getElementById('db-status-indicator');
    if (indicator) indicator.textContent = 'Database Connection: Supabase Cloud';

    let holidays = [];
    if (holData && holData.length > 0) {
      setHolidayDeletionFlag(false);
      setHolidayTableMissingFlag(false);
      holidays = holData.map(h => ({ date: h.date ? String(h.date).substring(0, 10) : null, name: h.name, state: h.state || 'All' }));
    } else {
      holidays = getHolidayDeletionFlag() ? [] : (DB.holidays || DEFAULT_DB.holidays || []);
    }
    
    if (!emps || emps.length === 0) {
      if (window._hasSeededSupabase) {
        console.warn("Seeding already attempted. Bailing out of init recursion.");
        await loadLocalDB();
        isLoadingData = false;
        return;
      }
      window._hasSeededSupabase = true;
      if (isSilent !== true) showToast("Seeding database with default records...");
      await seedSupabaseDatabase();
      isLoadingData = false;
      await initSupabaseData(isSilent);
      return;
    }
    
    // Preserve local sort order if possible
    try {
      if (typeof DB !== 'undefined' && DB) {
        var empOrderRaw = [];
        try { empOrderRaw = JSON.parse(localStorage.getItem('adonis_order_emps') || '[]'); } catch(e){}
        if (DB.employees && DB.employees.length > 0) empOrderRaw = DB.employees.map(em => em.id);
        if (empOrderRaw && empOrderRaw.length > 0) {
          const empMap = {};
          empOrderRaw.forEach((id, idx) => { empMap[String(id || '').trim().toUpperCase()] = idx; });
          emps.sort(function(a, b) {
            var idA = String(a.id || '').trim().toUpperCase();
            var idB = String(b.id || '').trim().toUpperCase();
            var idxA = empMap[idA] !== undefined ? empMap[idA] : 999999;
            var idxB = empMap[idB] !== undefined ? empMap[idB] : 999999;
            return idxA - idxB;
          });
        }
        
        var docOrderRaw = [];
        try { docOrderRaw = JSON.parse(localStorage.getItem('adonis_order_docs') || '[]'); } catch(e){}
        if (DB.doctors && DB.doctors.length > 0) docOrderRaw = DB.doctors.map(d => d.id);
        if (docOrderRaw && docOrderRaw.length > 0) {
          const docMap = {};
          docOrderRaw.forEach((id, idx) => { docMap[String(id || '').trim().toUpperCase()] = idx; });
          doctors.sort(function(a, b) {
            var idA = String(a.id || '').trim().toUpperCase();
            var idB = String(b.id || '').trim().toUpperCase();
            var idxA = docMap[idA] !== undefined ? docMap[idA] : 999999;
            var idxB = docMap[idB] !== undefined ? docMap[idB] : 999999;
            return idxA - idxB;
          });
        }
        
        var chemOrderRaw = [];
        try { chemOrderRaw = JSON.parse(localStorage.getItem('adonis_order_chems') || '[]'); } catch(e){}
        if (DB.chemists && DB.chemists.length > 0) chemOrderRaw = DB.chemists.map(c => c.id);
        if (chemOrderRaw && chemOrderRaw.length > 0) {
          const chemMap = {};
          chemOrderRaw.forEach((id, idx) => { chemMap[String(id || '').trim().toUpperCase()] = idx; });
          chemists.sort(function(a, b) {
            var idA = String(a.id || '').trim().toUpperCase();
            var idB = String(b.id || '').trim().toUpperCase();
            var idxA = chemMap[idA] !== undefined ? chemMap[idA] : 999999;
            var idxB = chemMap[idB] !== undefined ? chemMap[idB] : 999999;
            return idxA - idxB;
          });
        }

        var stockistOrderRaw = [];
        try { stockistOrderRaw = JSON.parse(localStorage.getItem('adonis_order_stockists') || '[]'); } catch(e){}
        if (DB.stockists && DB.stockists.length > 0) stockistOrderRaw = DB.stockists.map(s => s.id);
        if (stockistOrderRaw && stockistOrderRaw.length > 0) {
          const stockistMap = {};
          stockistOrderRaw.forEach((id, idx) => { stockistMap[String(id || '').trim().toUpperCase()] = idx; });
          if (stockists) {
            stockists.sort(function(a, b) {
              var idA = String(a.id || '').trim().toUpperCase();
              var idB = String(b.id || '').trim().toUpperCase();
              var idxA = stockistMap[idA] !== undefined ? stockistMap[idA] : 999999;
              var idxB = stockistMap[idB] !== undefined ? stockistMap[idB] : 999999;
              return idxA - idxB;
            });
          }
        }
      }
    } catch(e) {
      console.warn("Sorting failed:", e);
    }
    
    // ABORT OVERWRITE IF A SYNC IS CURRENTLY RUNNING OR PENDING
    // Otherwise we will wipe out local changes that haven't been pushed to the cloud yet
    if (isSyncing || syncPending) {
      console.warn("initSupabaseData aborting DB overwrite because a sync is running/pending.");
      isLoadingData = false;
      return;
    }
    
    // Build a map of current local employees for pending-changes protection
    var _existingLocalEmpsMap = {};
    if (typeof DB !== 'undefined' && DB && Array.isArray(DB.employees)) {
      DB.employees.forEach(function(em) { if (em && em.id) _existingLocalEmpsMap[String(em.id).toUpperCase()] = em; });
    }

    DB = {
      employees: emps
        // Filter out any employee that was locally deleted but not yet confirmed deleted in Supabase
        .filter(function(e) { return !_pendingDeletedEmpIds.has(String(e.id || '').toUpperCase()); })
        .map(function(e) {
          var empIdUpper = String(e.id || '').toUpperCase();
          var safeRole = (e.role || 'emp').trim().toLowerCase();
          var cloudDesigRaw = e.designation;
          var parsedLeaves = parseJSONField(e.leaves);
          if ((typeof cloudDesigRaw === 'undefined' || cloudDesigRaw === null || cloudDesigRaw === '') && parsedLeaves._designation) {
            cloudDesigRaw = parsedLeaves._designation;
          }
          var cloudDesig = cloudDesigRaw;
          var existing = _existingLocalEmpsMap[empIdUpper] || null;
          var localDesig = existing ? existing.designation : undefined;

          // If this employee has a pending local change (e.g. block/unblock not yet confirmed in cloud),
          // keep ALL local fields for this record to prevent the poller from reverting the change.
          if (_pendingLocalEmpIds.has(empIdUpper) && existing) {
            return Object.assign({}, existing);
          }

          return {
            id: e.id,
            name: e.name,
            pwd: e.pwd,
            area: e.area || '',
            role: safeRole,
            managerId: e.manager_id || '',
            doj: (function(d){ if(!d) return ''; var p=d.split('-'); if(p.length===3) return p[2]+'/'+p[1]+'/'+p[0]; return d; })(e.doj),
            state: e.state || '',
            status: e.status || 'Active',
            accountStatus: normalizeAccountStatus(e.account_status),
            blockedDate: e.blocked_date || '',
            blockedReason: e.blocked_reason || '',
            designation: (typeof cloudDesig !== 'undefined' && cloudDesig !== null && cloudDesig !== '') ? cloudDesig : (typeof localDesig !== 'undefined' && localDesig !== '' ? localDesig : ''),
            allowedPastDates: parsedLeaves._allowedPastDates || [],
            leaves: parsedLeaves
          };
        }),
      doctors: (function() {
        var cloudDocs = (doctors || [])
          .filter(function(d) { return !_pendingDeletedDocIds.has(String(d.id)); })
          .map(d => ({
            id: d.id,
            code: d.code,
          name: d.name,
          beName: d.be_name,
          hq: d.hq,
          managerName: d.manager_name,
          spec: d.spec,
          qual: d.qual,
          address: d.address,
          city: (d.city || '').trim() || (d.area || '').trim() || '',
          area: d.area,
          state: d.state,
          territoryType: d.territory_type,
          phone: d.phone,
          assignTo: d.assign_to,
          status: d.status
        }));
        var localDocs = (typeof DB !== 'undefined' && DB && DB.doctors) ? DB.doctors : [];
        restoreLocalAssignTo('doctors', cloudDocs);
        restoreLocalManagerName('doctors', cloudDocs);
        
        var cloudIds = new Set(cloudDocs.map(function(d){ return String(d.id); }));
        var missingLocal = localDocs.filter(function(d) {
          return !cloudIds.has(String(d.id)) && !_pendingDeletedDocIds.has(String(d.id));
        });
        
        var mergedDocs = cloudDocs.concat(missingLocal);
        
        if (missingLocal.length > 0) {
          console.warn('Preserving ' + missingLocal.length + ' unsynced local doctors. Triggering re-sync.');
          setTimeout(function() { if (typeof syncSupabaseDatabase === 'function') syncSupabaseDatabase(); }, 2000);
        }
        return mergedDocs;
      })(),
      chemists: (function() {
        var cloudChems = (chemists || []).map(c => {
          var stateVal = c.state || '';
          if ((!stateVal || stateVal.trim() === '') && c.assign_to) {
            var emp = emps.find(function(e) { return String(e.id || '').trim().toUpperCase() === String(c.assign_to).trim().toUpperCase(); });
            if (emp && emp.state) stateVal = emp.state;
          }
          return {
            id: c.id,
            name: c.name,
            area: c.area,
            assignTo: c.assign_to,
            state: stateVal,
            city: c.area || ''
          };
        });
        var localChems = (typeof DB !== 'undefined' && DB && DB.chemists) ? DB.chemists : [];
        restoreLocalAssignTo('chemists', cloudChems);
        restoreLocalAssignTo('chemists', cloudChems);
        if (cloudChems.length === 0 && localChems.length > 0) {
          console.warn('Supabase returned 0 chemists but local DB has ' + localChems.length + '. Keeping local data.');
          return localChems;
        }
        if (cloudChems.length < localChems.length) {
          console.warn('Supabase returned fewer chemists (' + cloudChems.length + ') than local (' + localChems.length + '). Keeping local data. Triggering re-sync.');
          setTimeout(function() { if (typeof syncSupabaseDatabase === 'function') syncSupabaseDatabase(); }, 2000);
          return localChems;
        }
        return cloudChems;
      })(),
      stockists: (function() {
        var cloudStockists = (stockists || []).map(s => {
          var stateVal = s.state || '';
          if ((!stateVal || stateVal.trim() === '') && s.assign_to) {
            var emp = emps.find(function(e) { return String(e.id || '').trim().toUpperCase() === String(s.assign_to).trim().toUpperCase(); });
            if (emp && emp.state) stateVal = emp.state;
          }
          return {
            id: s.id,
            name: s.name,
            area: s.area,
            assignTo: s.assign_to,
            state: stateVal
          };
        });
        var localStockists = (typeof DB !== 'undefined' && DB && DB.stockists) ? DB.stockists : [];
        restoreLocalAssignTo('stockists', cloudStockists);
        restoreLocalAssignTo('stockists', cloudStockists);
        if (cloudStockists.length === 0 && localStockists.length > 0) {
          console.warn('Supabase returned 0 stockists but local DB has ' + localStockists.length + '. Keeping local data.');
          return localStockists;
        }
        if (cloudStockists.length < localStockists.length) {
          console.warn('Supabase returned fewer stockists (' + cloudStockists.length + ') than local (' + localStockists.length + '). Keeping local data. Triggering re-sync.');
          setTimeout(function() { if (typeof syncSupabaseDatabase === 'function') syncSupabaseDatabase(); }, 2000);
          return localStockists;
        }
        return cloudStockists;
      })(),
      products: (typeof DB !== 'undefined' && DB && Array.isArray(DB.products) && DB.products.length > 0) ? DB.products : DEFAULT_DB.products,
      gifts: (typeof DB !== 'undefined' && DB && Array.isArray(DB.gifts) && DB.gifts.length > 0) ? DB.gifts : DEFAULT_DB.gifts,
      inputs: (typeof DB !== 'undefined' && DB && Array.isArray(DB.inputs) && DB.inputs.length > 0) ? DB.inputs : DEFAULT_DB.inputs,
      // Merge cloud reports with any locally pending reports that haven't been confirmed yet.
      // Without this, the 30-second poller would wipe out newly submitted reports that
      // are still in-flight to Supabase.
      reports: (function() {
        var cloudReports = (reports || []).map(r => {
          var cleanRemarks = r.remarks || '';
          var workType = 'FIELD WORK';
          var territory = '';
          var city = '';
          var patch = '';
          var isFinal = false;
          if (cleanRemarks.indexOf('\n===METADATA===\n') !== -1) {
            var parts = cleanRemarks.split('\n===METADATA===\n');
            cleanRemarks = parts[0];
            try {
              var meta = JSON.parse(parts[1]);
              workType = meta.workType || 'FIELD WORK';
              territory = meta.territory || '';
              city = meta.city || '';
              patch = meta.patch || '';
              isFinal = meta.isFinal === true;
            } catch(e){}
          }
          return {
            id: r.id,
            empId: r.emp_id,
            empName: r.emp_name,
            date: r.date ? String(r.date).substring(0, 10) : null,
            time: r.time,
            targetType: r.target_type,
            classification: r.classification,
            callType: r.call_type,
            docId: r.doc_id,
            docName: r.doc_name,
            docSpec: r.doc_spec,
            docArea: r.doc_area,
            promotedProducts: r.promoted_products || [],
            samples: parseJSONField(r.samples),
            gifts: parseJSONField(r.gifts),
            inputs: parseJSONField(r.inputs),
            chemId: r.chem_id,
            chemName: r.chem_name,
            chemArea: r.chem_area,
            stockId: r.stock_id,
            stockName: r.stock_name,
            stockArea: r.stock_area,
            orderAmount: parseFloat(r.order_amount) || 0,
            stockStatus: r.stock_status,
            jfwMgrId: r.jfw_mgr_id,
            jfwMgrName: r.jfw_mgr_name,
            jfwRemarks: r.jfw_remarks,
            lat: r.lat,
            lng: r.lng,
            remarks: cleanRemarks,
            workType: workType,
            territory: territory,
            city: city,
            patch: patch,
            isFinal: isFinal,
            nextVisit: r.next_visit
          };
        });
        // Keep any locally pending reports not yet confirmed in cloud
        if (_pendingLocalReportIds.size > 0 && typeof DB !== 'undefined' && DB && Array.isArray(DB.reports)) {
          var cloudIds = new Set(cloudReports.map(function(r) { return String(r.id); }));
          DB.reports.forEach(function(localRep) {
            if (_pendingLocalReportIds.has(String(localRep.id)) && !cloudIds.has(String(localRep.id))) {
              cloudReports.unshift(localRep);
            }
          });
        }
        return cloudReports;
      })(),

      tourPlans: (tourPlans || []).map(tp => ({
        id: tp.id,
        empId: tp.emp_id,
        empName: tp.emp_name,
        month: tp.month,
        managerId: tp.manager_id,
        managerName: tp.manager_name,
        days: typeof tp.days === 'string' ? JSON.parse(tp.days) : (tp.days || []),
        status: tp.status,
        remarks: tp.remarks,
        submittedAt: tp.submitted_at,
        approvedDate: tp.approved_date,
        approvedBy: tp.approved_by,
        revisionHistory: typeof tp.revision_history === 'string' ? JSON.parse(tp.revision_history) : (tp.revision_history || [])
      })),
      expenses: (expenses || []).map(ex => ({
        id: ex.id,
        empId: ex.emp_id,
        empName: ex.emp_name,
        month: ex.month,
        managerId: ex.manager_id,
        lines: typeof ex.lines === 'string' ? (function() {
          try {
            var parsed = JSON.parse(ex.lines);
            return Array.isArray(parsed) ? parsed : [];
          } catch(e) {
            return [];
          }
        })() : (Array.isArray(ex.lines) ? ex.lines : []),
        total: parseFloat(ex.total) || 0,
        receiptFile: ex.receipt_file,
        status: ex.status,
        submittedAt: ex.submitted_at,
        remarks: ex.remarks
      })),
      leaves: (leaves || []).map(lv => ({
        id: lv.id,
        empId: lv.emp_id,
        empName: lv.emp_name,
        type: lv.type,
        start: lv.start,
        end: lv.end,
        days: lv.days,
        reason: lv.reason,
        managerId: lv.manager_id,
        status: lv.status,
        submittedAt: lv.submitted_at,
        remarks: lv.remarks
      })),
      cityRates: DEFAULT_DB.cityRates,
      sfc: (function() {
        var cloudSfc = [];
        var seenKeys = new Set();
        (sfc || []).forEach(s => {
          let extra = {};
          let isJson = false;
          try {
            if (s.mode && s.mode.startsWith('{')) {
              extra = JSON.parse(s.mode);
              isJson = true;
            }
          } catch(e){}
          var item = {
            id: s.id,
            from: s.from_loc || '',
            to: s.to_loc || '',
            distance: s.distance || 0,
            mode: isJson ? (extra.mode !== undefined ? extra.mode : '') : (s.mode || ''),
            fare: s.fare || 0,
            da: s.da || 0,
            empId: s.emp_id !== undefined && s.emp_id !== null ? s.emp_id : (extra.empId || ''),
            workingDays: s.working_days !== undefined && s.working_days !== null ? s.working_days : (extra.workingDays || ''),
            empName: s.emp_name !== undefined && s.emp_name !== null ? s.emp_name : (extra.empName || ''),
            hq: s.hq !== undefined && s.hq !== null ? s.hq : (extra.hq || ''),
            state: s.state !== undefined && s.state !== null ? s.state : (extra.state || ''),
            category: s.category !== undefined && s.category !== null ? s.category : (extra.category || ''),
            total: s.total !== undefined && s.total !== null ? (parseFloat(s.total) || 0) : (extra.total || (s.fare + s.da)),
            doctors: s.doctors !== undefined && s.doctors !== null ? s.doctors : (extra.doctors || ''),
            business: s.business !== undefined && s.business !== null ? s.business : (extra.business || ''),
            lodge: s.lodge !== undefined && s.lodge !== null ? s.lodge : 0,
            other: s.other !== undefined && s.other !== null ? s.other : 0
          };
          var k = normalizeSfcKey(item);
          if (!seenKeys.has(k)) {
            seenKeys.add(k);
            cloudSfc.push(item);
          }
        });
        var localSfc = (typeof DB !== 'undefined' && DB && DB.sfc) ? DB.sfc : [];
        if (cloudSfc.length === 0 && localSfc.length > 0) {
          console.warn('Supabase returned 0 SFC rows but local DB has ' + localSfc.length + '. Keeping local data to prevent loss.');
          return localSfc;
        }
        return cloudSfc;
      })(),
      samplesInventory: (function() {
        var cloudSamples = [];
        var seen = new Set();
        (samplesInv || []).forEach(s => {
          if (!s || !s.emp_id || !s.prod_name) return;
          var key = String(s.emp_id).toUpperCase().trim() + '|' + String(s.prod_name).toUpperCase().trim();
          if (!seen.has(key)) {
            seen.add(key);
            cloudSamples.push({
              id: s.id,
              prodName: s.prod_name,
              empId: s.emp_id,
              opening: s.opening || 0,
              received: s.received || 0,
              distributed: s.distributed || 0,
              balance: s.balance || 0
            });
          }
        });
        if (typeof DB !== 'undefined' && DB && Array.isArray(DB.samplesInventory)) {
          DB.samplesInventory.forEach(function(localSample) {
            if (localSample && localSample.id && String(localSample.id).startsWith('SAMPLEINV')) {
              var key = String(localSample.empId).toUpperCase().trim() + '|' + String(localSample.prodName).toUpperCase().trim();
              if (!seen.has(key)) {
                seen.add(key);
                cloudSamples.push(localSample);
              }
            }
          });
        }
        return cloudSamples;
      })(),
      giftsInventory: (function() {
        var cloudGifts = [];
        var seen = new Set();
        (giftsInv || []).forEach(g => {
          if (!g || !g.emp_id || !g.gift_name) return;
          var key = String(g.emp_id).toUpperCase().trim() + '|' + String(g.gift_name).toUpperCase().trim();
          if (!seen.has(key)) {
            seen.add(key);
            cloudGifts.push({
              id: g.id,
              giftName: g.gift_name,
              empId: g.emp_id,
              opening: g.opening || 0,
              received: g.received || 0,
              distributed: g.distributed || 0,
              balance: g.balance || 0
            });
          }
        });
        if (typeof DB !== 'undefined' && DB && Array.isArray(DB.giftsInventory)) {
          DB.giftsInventory.forEach(function(localGift) {
            if (localGift && localGift.id && String(localGift.id).startsWith('GIFTINV')) {
              var key = String(localGift.empId).toUpperCase().trim() + '|' + String(localGift.giftName).toUpperCase().trim();
              if (!seen.has(key)) {
                seen.add(key);
                cloudGifts.push(localGift);
              }
            }
          });
        }
        return cloudGifts;
      })(),
      inputsInventory: (function() {
        var cloudInputs = [];
        var seen = new Set();
        (inputsInv || []).forEach(i => {
          if (!i || !i.emp_id || !i.input_name) return;
          var key = String(i.emp_id).toUpperCase().trim() + '|' + String(i.input_name).toUpperCase().trim();
          if (!seen.has(key)) {
            seen.add(key);
            cloudInputs.push({
              id: i.id,
              inputName: i.input_name,
              empId: i.emp_id,
              opening: i.opening || 0,
              received: i.received || 0,
              distributed: i.distributed || 0,
              balance: i.balance || 0
            });
          }
        });
        if (typeof DB !== 'undefined' && DB && Array.isArray(DB.inputsInventory)) {
          DB.inputsInventory.forEach(function(localInput) {
            if (localInput && localInput.id && String(localInput.id).startsWith('INPUTINV')) {
              var key = String(localInput.empId).toUpperCase().trim() + '|' + String(localInput.inputName).toUpperCase().trim();
              if (!seen.has(key)) {
                seen.add(key);
                cloudInputs.push(localInput);
              }
            }
          });
        }
        return cloudInputs;
      })(),
      attendance: (attendanceData || []).map(function(a) {
        return {
          id: a.id,
          employeeId: a.employee_id,
          date: a.date,
          loginTime: a.login_time || '',
          attendanceStatus: a.attendance_status || '',
          remarks: a.remarks || '',
          createdAt: a.created_at || ''
        };
      }),
      weeklyOffConfig: (weeklyOffData || []).map(function(w) {
        return {
          id: w.id,
          employeeId: w.employee_id || '',
          weekday: typeof w.weekday === 'number' ? w.weekday : parseInt(w.weekday || '0', 10) || 0
        };
      }),
      holidays: holidays,
      announcements: (announcements || []).map(a => ({
        id: a.id,
        senderId: a.sender_id,
        senderName: a.sender_name,
        title: a.title || 'Namaskaram!',
        message: a.message,
        targetType: a.target_type,
        targetValue: a.target_value,
        acknowledgedBy: a.acknowledged_by || [],
        fileData: a.file_data || '',
        fileType: a.file_type || ''
      }))
    };
    
    // Align products list and replace any ALL CAPS or misaligned names with Title Case standard
    if (Array.isArray(DB.products)) {
      DB.products = DB.products.map(function(p) {
        var matched = DEFAULT_DB.products.find(function(dp) { return cleanNameForComparison(dp) === cleanNameForComparison(p); });
        return matched || p;
      });
      DB.products = Array.from(new Set(DB.products));
    }
    // Align gifts list
    if (Array.isArray(DB.gifts)) {
      DB.gifts = DB.gifts.map(function(g) {
        var matched = DEFAULT_DB.gifts.find(function(dg) { return cleanNameForComparison(dg) === cleanNameForComparison(g); });
        return matched || g;
      });
      DB.gifts = Array.from(new Set(DB.gifts));
    }
    // Align inputs list
    if (Array.isArray(DB.inputs)) {
      DB.inputs = DB.inputs.map(function(i) {
        var matched = DEFAULT_DB.inputs.find(function(di) { return cleanNameForComparison(di) === cleanNameForComparison(i); });
        return matched || i;
      });
      DB.inputs = Array.from(new Set(DB.inputs));
    }

    // Auto-correct pre-existing inventory entries to use the Title Case standard names
    DB.samplesInventory.forEach(function(s) {
      var matched = DEFAULT_DB.products.find(function(dp) { return cleanNameForComparison(dp) === cleanNameForComparison(s.prodName); });
      if (matched) s.prodName = matched;
    });
    DB.giftsInventory.forEach(function(g) {
      var matched = DEFAULT_DB.gifts.find(function(dg) { return cleanNameForComparison(dg) === cleanNameForComparison(g.giftName); });
      if (matched) g.giftName = matched;
    });
    DB.inputsInventory.forEach(function(i) {
      var matched = DEFAULT_DB.inputs.find(function(di) { return cleanNameForComparison(di) === cleanNameForComparison(i.inputName); });
      if (matched) i.inputName = matched;
    });
    
    hasInitializedData = true;
    // Wrap in try/catch so a crash here doesn't overwrite fresh Supabase data with stale local cache
    try { ensureAttendanceSchedulerUpToDate(); } catch(e) { console.warn('Attendance scheduler error (non-fatal):', e); }
    try { scheduleNextAttendanceValidation(); } catch(e) {}

    // Save synchronized DB to IndexedDB
    try {
      await idb.set('adonis_db', DB);
    } catch (e) {}

    // Save synchronized DB to local storage cache
    try {
      localStorage.setItem('adonis_db', JSON.stringify(DB));
    } catch (e) {
      try {
        var dbCopy = Object.assign({}, DB);
        dbCopy.doctors = [];
        dbCopy.chemists = [];
        dbCopy.stockists = [];
        dbCopy.reports = [];
        dbCopy.tourPlans = [];
        dbCopy.expenses = [];
        dbCopy.leaves = [];
        localStorage.setItem('adonis_db', JSON.stringify(dbCopy));
      } catch (e2) {}
    }
    
    // Refresh the UI with the fresh data
    if (SESSION.user) {
      var freshUser = DB.employees.find(function(e) { return String(e.id || '').trim().toUpperCase() === String(SESSION.user.id || '').trim().toUpperCase(); });
      if (freshUser) {
        var currentPwd = SESSION.user.pwd;
        SESSION.user = freshUser;
        SESSION.user.pwd = currentPwd;
        localStorage.setItem('adonis_session', JSON.stringify(SESSION));
      }

      if (SESSION.user.role === 'admin' || SESSION.user.role === 'manager' || SESSION.user.role === 'am' || SESSION.user.role === 'rm' || SESSION.user.role === 'zm' || SESSION.user.role === 'nsm') {
        renderAdminStats();
        if (SESSION.user.role === 'admin') {
          populateAttendanceEmployeeFilter();
          renderAttendanceDashboard();
        }
        if (isSilent !== true) {
          populateReportTerritoryDropdowns();
          renderAdminDashTeamList();
          renderAdminTPApprovals();
          renderAdminExpApprovals();
          renderAdminLeaveApprovals();
          renderEmpTable();
          renderAdminDocList();
          renderAdminChemistList();
          renderSFCTable();
          loadCityRates();
          populateAdminEmpMgr();
          populateAdminEmpFilters();
          populateInventoryItemSelect();
          renderAdminInventoryTables();
        }
      } else {
        if (isSilent !== true) {
          populateReportingDropdowns();
          populateReportTerritoryDropdowns();
          renderDocList();
          renderChemistList();
          populateJFWManagers();
          checkMTPForSelectedDate(true);
          renderLeaveBalances();
          renderMyLeaves();
        }
        renderHomeStats();
      }
    }
    
    
  // Auto-repair any unassigned records using beName (for doctors) or similar logic
  var didRepair = false;
  
  if (DB.doctors) {
    DB.doctors.forEach(d => {
      if ((!d.assignTo || d.assignTo === 'UNASSIGNED') && d.beName) {
        var match = DB.employees.find(e => String(e.name).toUpperCase().trim() === String(d.beName).toUpperCase().trim());
        if (match) {
          d.assignTo = match.id;
          didRepair = true;
        }
      }
    });
  }

  if (didRepair) {
    console.log('Auto-repaired unassigned doctors based on BE Name.');
    saveDB();
    if (typeof syncSupabaseDatabase === 'function') {
      setTimeout(syncSupabaseDatabase, 3000); // give it a moment, then push to cloud
    }
  }

    if (isSilent !== true) showToast("Supabase data synchronized!");
    if (window._supabaseLoadTimeout) {
      clearTimeout(window._supabaseLoadTimeout);
      window._supabaseLoadTimeout = null;
    }
    isLoadingData = false;
    
  } catch (err) {
    if (window._supabaseLoadTimeout) {
      clearTimeout(window._supabaseLoadTimeout);
      window._supabaseLoadTimeout = null;
    }
    console.error("Supabase load failed. Falling back to LocalStorage:", err);
    // Only fall back to local cache if Supabase data was NOT already loaded
    if (!hasInitializedData) {
      if (isSilent !== true) {
        showToast("Using local database cache.");
      }
      await loadLocalDB();
    }
    isLoadingData = false;
  }
}

async function loadLocalDB() {
  try {
    var cachedUserId = localStorage.getItem('adonis_db_user_id');
    if (SESSION && SESSION.user && SESSION.user.id && cachedUserId && String(SESSION.user.id).toUpperCase() !== String(cachedUserId).toUpperCase()) {
      console.warn("Cached database belongs to a different user (" + cachedUserId + "). Clearing cache.");
      DB = DEFAULT_DB;
      localStorage.removeItem('adonis_db');
      localStorage.removeItem('adonis_db_user_id');
      try { await idb.clear(); } catch(e) {}
      return;
    }
    var idbData = await idb.get('adonis_db');
    if (idbData && typeof idbData === 'object') {
      DB = idbData;
      console.log("Database loaded from IndexedDB cache.");
    } else {
      var raw = localStorage.getItem('adonis_db');
      DB = raw ? JSON.parse(raw) : DEFAULT_DB;
      console.log("Database loaded from localStorage cache.");
    }
  } catch(e) {
    try {
      var raw = localStorage.getItem('adonis_db');
      DB = raw ? JSON.parse(raw) : DEFAULT_DB;
    } catch(e2) {
      DB = DEFAULT_DB;
    }
  }
  if (!DB || typeof DB !== 'object') {
    DB = DEFAULT_DB;
  }
  if (!Array.isArray(DB.employees)) DB.employees = DEFAULT_DB.employees || [];
  DB.employees.forEach(function(e) {
    if (e && e.id) {
      if (String(e.id).toUpperCase() === 'ADMIN') {
        e.pwd = 'adonis@1234';
      } else {
        e.pwd = String(e.id);
      }
    }
  });
  if (!Array.isArray(DB.doctors)) DB.doctors = DEFAULT_DB.doctors || [];
  if (!Array.isArray(DB.chemists)) DB.chemists = DEFAULT_DB.chemists || [];
  if (!Array.isArray(DB.stockists)) DB.stockists = DEFAULT_DB.stockists || [];
  if (!Array.isArray(DB.products)) DB.products = DEFAULT_DB.products || [];
  if (!Array.isArray(DB.gifts)) DB.gifts = DEFAULT_DB.gifts || [];
  if (!Array.isArray(DB.inputs)) DB.inputs = DEFAULT_DB.inputs || [];
  if (!Array.isArray(DB.reports)) DB.reports = DEFAULT_DB.reports || [];
  if (!Array.isArray(DB.tourPlans)) DB.tourPlans = DEFAULT_DB.tourPlans || [];
  if (!Array.isArray(DB.expenses)) DB.expenses = DEFAULT_DB.expenses || [];
  DB.expenses.forEach(function(ex) {
    if (ex && typeof ex.lines === 'string') {
      try {
        var parsed = JSON.parse(ex.lines);
        ex.lines = Array.isArray(parsed) ? parsed : [];
      } catch(e) {
        ex.lines = [];
      }
    } else if (ex && !Array.isArray(ex.lines)) {
      ex.lines = [];
    }
  });
  if (!Array.isArray(DB.leaves)) DB.leaves = DEFAULT_DB.leaves || [];
  if (!Array.isArray(DB.holidays)) DB.holidays = DEFAULT_DB.holidays || [];
  if (!Array.isArray(DB.samplesInventory)) DB.samplesInventory = DEFAULT_DB.samplesInventory || [];
  if (!Array.isArray(DB.giftsInventory)) DB.giftsInventory = DEFAULT_DB.giftsInventory || [];
  if (!Array.isArray(DB.inputsInventory)) DB.inputsInventory = DEFAULT_DB.inputsInventory || [];
  if (!Array.isArray(DB.sfc)) DB.sfc = DEFAULT_DB.sfc || [];
  if (!Array.isArray(DB.attendance)) DB.attendance = DEFAULT_DB.attendance || [];
  if (!Array.isArray(DB.weeklyOffConfig)) DB.weeklyOffConfig = DEFAULT_DB.weeklyOffConfig || [];

  // Align products list and replace any ALL CAPS or misaligned names with Title Case standard
  if (Array.isArray(DB.products)) {
    DB.products = DB.products.map(function(p) {
      var matched = DEFAULT_DB.products.find(function(dp) { return cleanNameForComparison(dp) === cleanNameForComparison(p); });
      return matched || p;
    });
    DB.products = Array.from(new Set(DB.products));
  }
  // Align gifts list
  if (Array.isArray(DB.gifts)) {
    DB.gifts = DB.gifts.map(function(g) {
      var matched = DEFAULT_DB.gifts.find(function(dg) { return cleanNameForComparison(dg) === cleanNameForComparison(g); });
      return matched || g;
    });
    DB.gifts = Array.from(new Set(DB.gifts));
  }
  // Align inputs list
  if (Array.isArray(DB.inputs)) {
    DB.inputs = DB.inputs.map(function(i) {
      var matched = DEFAULT_DB.inputs.find(function(di) { return cleanNameForComparison(di) === cleanNameForComparison(i); });
      return matched || i;
    });
    DB.inputs = Array.from(new Set(DB.inputs));
  }

  // Auto-correct pre-existing inventory entries to use the Title Case standard names
  DB.samplesInventory.forEach(function(s) {
    var matched = DEFAULT_DB.products.find(function(dp) { return cleanNameForComparison(dp) === cleanNameForComparison(s.prodName); });
    if (matched) s.prodName = matched;
  });
  DB.giftsInventory.forEach(function(g) {
    var matched = DEFAULT_DB.gifts.find(function(dg) { return cleanNameForComparison(dg) === cleanNameForComparison(g.giftName); });
    if (matched) g.giftName = matched;
  });
  DB.inputsInventory.forEach(function(i) {
    var matched = DEFAULT_DB.inputs.find(function(di) { return cleanNameForComparison(di) === cleanNameForComparison(i.inputName); });
    if (matched) i.inputName = matched;
  });
  var sfcUpdated = false;
  DB.sfc.forEach(function(s) {
    if (s && typeof s.mode === 'string' && s.mode.startsWith('{')) {
      try {
        var extra = JSON.parse(s.mode);
        s.mode = extra.mode !== undefined ? extra.mode : '';
        s.empId = s.empId || extra.empId || '';
        s.workingDays = s.workingDays || extra.workingDays || '';
        s.empName = s.empName || extra.empName || '';
        s.hq = s.hq || extra.hq || '';
        s.state = s.state || extra.state || '';
        s.category = s.category || extra.category || '';
        s.total = s.total || extra.total || (s.fare + s.da);
        s.doctors = s.doctors || extra.doctors || '';
        s.business = s.business || extra.business || '';
        sfcUpdated = true;
      } catch(e){}
    }
  });
  if (!Array.isArray(DB.announcements)) DB.announcements = [];

  if (DB.reports.length === 0) {
    DB.reports = JSON.parse(JSON.stringify(DEFAULT_DB.reports || []));
  } else {
    DB.reports.forEach(function(r) {
      r.samples = parseJSONField(r.samples);
      r.gifts = parseJSONField(r.gifts);
      r.inputs = parseJSONField(r.inputs);
    });
  }
  
  var updated = sfcUpdated;
  DB.employees.forEach(function(e) {
    if (!e || !e.id) return;
    var def = DEFAULT_DB.employees.find(function(d){return d.id === e.id;});
    if (!e.doj) { e.doj = def ? def.doj : '2026-01-01'; updated = true; }
    if (!e.state) { e.state = def ? def.state : 'Maharashtra'; updated = true; }
    if (!e.status) { e.status = def ? def.status : 'Active'; updated = true; }
    if (!e.pwd) { e.pwd = def ? def.pwd : 'pass123'; updated = true; }
    if (!e.accountStatus) { e.accountStatus = 'ACTIVE'; updated = true; }
    if (typeof e.blockedDate === 'undefined') { e.blockedDate = ''; updated = true; }
    if (typeof e.blockedReason === 'undefined') { e.blockedReason = ''; updated = true; }
    var normalizedRole = (e.role || 'emp').trim().toLowerCase();
    if (e.role !== normalizedRole) {
      e.role = normalizedRole;
      updated = true;
    }
    var defaultDesignation = def ? def.designation : getDefaultEmployeeDesignation(e.role);
    if (!e.designation) { e.designation = defaultDesignation; updated = true; }
    var normalizedStatus = normalizeEmployeeStatus(e.status);
    if (e.status !== normalizedStatus) {
      e.status = normalizedStatus;
      updated = true;
    }
    var normalizedAccountStatus = normalizeAccountStatus(e.accountStatus);
    if (e.accountStatus !== normalizedAccountStatus) {
      e.accountStatus = normalizedAccountStatus;
      updated = true;
    }
  });

  // Automatically fall back to assigned representative's state for doctors, chemists, and stockists if state is blank
  DB.doctors.forEach(function(d) {
    if ((!d.state || d.state.trim() === '') && d.assignTo) {
      var emp = DB.employees.find(function(e) { return String(e.id || '').trim().toUpperCase() === String(d.assignTo).trim().toUpperCase(); });
      if (emp && emp.state) { d.state = emp.state; updated = true; }
    }
  });

  DB.chemists.forEach(function(c) {
    if ((!c.state || c.state.trim() === '') && c.assignTo) {
      var emp = DB.employees.find(function(e) { return String(e.id || '').trim().toUpperCase() === String(c.assignTo).trim().toUpperCase(); });
      if (emp && emp.state) { c.state = emp.state; updated = true; }
    }
  });

  DB.stockists.forEach(function(s) {
    if ((!s.state || s.state.trim() === '') && s.assignTo) {
      var emp = DB.employees.find(function(e) { return String(e.id || '').trim().toUpperCase() === String(s.assignTo).trim().toUpperCase(); });
      if (emp && emp.state) { s.state = emp.state; updated = true; }
    }
  });

  if (getHolidayDeletionFlag()) {
    DB.holidays = [];
    updated = true;
  } else if (DB.holidays.length === 0) {
    DB.holidays = JSON.parse(JSON.stringify(DEFAULT_DB.holidays || []));
    updated = true;
  }
  if (updated || !localStorage.getItem('adonis_db')) {
    try {
      await idb.set('adonis_db', DB);
      localStorage.setItem('adonis_db', JSON.stringify(DB));
    } catch(e) {
      try {
        var dbCopy = Object.assign({}, DB);
        dbCopy.doctors = [];
        dbCopy.chemists = [];
        dbCopy.stockists = [];
        dbCopy.reports = [];
        dbCopy.tourPlans = [];
        dbCopy.expenses = [];
        dbCopy.leaves = [];
        localStorage.setItem('adonis_db', JSON.stringify(dbCopy));
      } catch (e2) {}
    }
  }
  hasInitializedData = true;
  var indicator = document.getElementById('db-status-indicator');
  if (indicator) indicator.textContent = 'Database Connection: Offline Mode (Cached)';
  try {
    ensureAttendanceSchedulerUpToDate();
  } catch(e) {
    console.error("ensureAttendanceSchedulerUpToDate failed:", e);
  }
  try {
    scheduleNextAttendanceValidation();
  } catch(e) {
    console.error("scheduleNextAttendanceValidation failed:", e);
  }
}
async function seedSupabaseDatabase() {
  try {
    const dbEmps = DEFAULT_DB.employees.map(function(e) {
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
        account_status: normalizeAccountStatus(e.accountStatus),
        blocked_date: formatDateForPostgres(e.blockedDate) || null,
        blocked_reason: e.blockedReason || null,
        designation: typeof e.designation !== 'undefined' ? (e.designation || '').trim() : getDefaultEmployeeDesignation(e.role),
        leaves: Object.assign({}, e.leaves || {CL:12,SL:10,EL:15,LWP:99,CL_used:0,SL_used:0,EL_used:0,LWP_used:0}, { _designation: typeof e.designation !== 'undefined' ? (e.designation || '').trim() : getDefaultEmployeeDesignation(e.role) })
      };
    });
    await insertEmployeeRowsToSupabase(dbEmps);
  } catch (e) { console.error("Error seeding employees:", e); }
  
  try {
    const dbDocs = DEFAULT_DB.doctors.map(d => ({
      id: d.id,
      code: d.code,
      name: d.name,
      spec: d.spec,
      qual: d.qual,
      address: d.address,
      city: d.city,
      area: d.area,
      phone: d.phone,
      assign_to: d.assignTo || null,
      status: d.status
    }));
    await supabase.from('doctors').insert(dbDocs);
  } catch (e) { console.error("Error seeding doctors:", e); }
  
  try {
    const dbChems = DEFAULT_DB.chemists.map(c => ({
      id: c.id,
      name: c.name,
      area: c.area,
      assign_to: c.assignTo || null
    }));
    await supabase.from('chemists').insert(dbChems);
  } catch (e) { console.error("Error seeding chemists:", e); }

  try {
    const dbSfc = DEFAULT_DB.sfc.map(s => ({
      from_loc: s.from,
      to_loc: s.to,
      distance: s.distance,
      mode: s.mode,
      fare: s.fare,
      da: s.da,
      lodge: s.lodge,
      other: s.other
    }));
    await supabase.from('sfc').insert(dbSfc);
  } catch (e) { console.error("Error seeding SFC:", e); }

  try {
    const dbSamples = DEFAULT_DB.samplesInventory.map(s => ({
      prod_name: s.prodName,
      emp_id: s.empId,
      opening: s.opening,
      received: s.received,
      distributed: s.distributed,
      balance: s.balance
    }));
    await supabase.from('samples_inventory').insert(dbSamples);
  } catch (e) { console.error("Error seeding samples:", e); }

  try {
    const dbGifts = DEFAULT_DB.giftsInventory.map(g => ({
      gift_name: g.giftName,
      emp_id: g.empId,
      opening: g.opening,
      received: g.received,
      distributed: g.distributed,
      balance: g.balance
    }));
    await supabase.from('gifts_inventory').insert(dbGifts);
  } catch (e) { console.error("Error seeding gifts:", e); }

  try {
    const dbInputs = DEFAULT_DB.inputsInventory.map(i => ({
      input_name: i.inputName,
      emp_id: i.empId,
      opening: i.opening,
      received: i.received,
      distributed: i.distributed,
      balance: i.balance
    }));
    await supabase.from('inputs_inventory').insert(dbInputs);
  } catch (e) { console.error("Error seeding inputs:", e); }

  try {
    const dbReports = DEFAULT_DB.reports.map(r => ({
      id: r.id,
      emp_id: r.empId,
      emp_name: r.empName,
      date: r.date,
      time: r.time,
      target_type: r.targetType,
      classification: r.classification,
      call_type: r.callType,
      doc_id: r.docId || null,
      doc_name: r.docName || null,
      doc_spec: r.docSpec || null,
      doc_area: r.docArea || null,
      promoted_products: r.promotedProducts || [],
      samples: parseJSONField(r.samples),
      gifts: parseJSONField(r.gifts),
      inputs: parseJSONField(r.inputs),
      chem_id: r.chemId || null,
      chem_name: r.chemName || null,
      chem_area: r.chemArea || null,
      order_amount: r.orderAmount || 0,
      stock_status: r.stockStatus || null,
      jfw_mgr_id: r.jfwMgrId || null,
      jfw_mgr_name: r.jfwMgrName || null,
      jfw_remarks: r.jfwRemarks || null,
      lat: r.lat || null,
      lng: r.lng || null,
      remarks: r.remarks || null,
      next_visit: r.nextVisit || null
    }));
    await supabase.from('reports').insert(dbReports);
  } catch (e) { console.error("Error seeding reports:", e); }
}

var _saveDBSyncTimer = null;

function persistLocalAssignTo(entityType, entityId, assignToVal) {
  try {
    var key = 'adonis_pending_' + entityType;
    var data = JSON.parse(localStorage.getItem(key) || '{}');
    if (assignToVal) {
      data[entityId] = assignToVal;
    } else {
      delete data[entityId];
    }
    localStorage.setItem(key, JSON.stringify(data));
  } catch(e) {}
}

function restoreLocalAssignTo(entityType, arr) {
  try {
    var key = 'adonis_pending_' + entityType;
    var data = JSON.parse(localStorage.getItem(key) || '{}');
    var keys = Object.keys(data);
    if (keys.length > 0 && Array.isArray(arr)) {
      arr.forEach(function(item) {
        if (data[item.id]) {
          item.assignTo = data[item.id];
          if (item.assign_to !== undefined) item.assign_to = data[item.id];
        }
      });
    }
  } catch(e) {}
}

function clearLocalAssignTo(entityType) {
  try {
    localStorage.removeItem('adonis_pending_' + entityType);
  } catch(e) {}
}

function persistLocalManagerName(entityType, entityId, val) {
  try {
    var key = 'adonis_pending_mgr_' + entityType;
    var data = JSON.parse(localStorage.getItem(key) || '{}');
    if (val !== undefined && val !== null) {
      data[entityId] = val;
    } else {
      delete data[entityId];
    }
    localStorage.setItem(key, JSON.stringify(data));
  } catch(e) {}
}

function restoreLocalManagerName(entityType, arr) {
  try {
    var key = 'adonis_pending_mgr_' + entityType;
    var data = JSON.parse(localStorage.getItem(key) || '{}');
    var keys = Object.keys(data);
    if (keys.length > 0 && Array.isArray(arr)) {
      arr.forEach(function(item) {
        if (data[item.id] !== undefined) {
          item.managerName = data[item.id];
          if (item.manager_name !== undefined) item.manager_name = data[item.id];
        }
      });
    }
  } catch(e) {}
}

function clearLocalManagerName(entityType) {
  try {
    localStorage.removeItem('adonis_pending_mgr_' + entityType);
  } catch(e) {}
}

function saveDB(skipSync) {
  if (DB) {
    if (Array.isArray(DB.samplesInventory)) {
      var seen = new Set();
      DB.samplesInventory = DB.samplesInventory.filter(function(s) {
        if (!s) return false;
        var key = String(s.empId).toUpperCase().trim() + '|' + String(s.prodName).toUpperCase().trim();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    }
    if (Array.isArray(DB.giftsInventory)) {
      var seen = new Set();
      DB.giftsInventory = DB.giftsInventory.filter(function(g) {
        if (!g) return false;
        var key = String(g.empId).toUpperCase().trim() + '|' + String(g.giftName).toUpperCase().trim();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    }
    if (Array.isArray(DB.inputsInventory)) {
      var seen = new Set();
      DB.inputsInventory = DB.inputsInventory.filter(function(i) {
        if (!i) return false;
        var key = String(i.empId).toUpperCase().trim() + '|' + String(i.inputName).toUpperCase().trim();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    }
  }

  idb.set('adonis_db', DB).then(function(success) {
    if (success) console.log("Database successfully cached to IndexedDB.");
  });

  try {
    localStorage.removeItem('adonis_db');
    if (SESSION && SESSION.user && SESSION.user.id) {
      localStorage.setItem('adonis_db_user_id', SESSION.user.id);
    }
    localStorage.setItem('adonis_order_emps', JSON.stringify((DB.employees||[]).map(x=>x.id)));
    localStorage.setItem('adonis_order_docs', JSON.stringify((DB.doctors||[]).map(x=>x.id)));
    localStorage.setItem('adonis_order_chems', JSON.stringify((DB.chemists||[]).map(x=>x.id)));
  } catch(e) {}

  try {
    localStorage.setItem('adonis_db', JSON.stringify(DB));
  } catch (e) {
    try {
      var dbCopy = Object.assign({}, DB);
      dbCopy.reports = [];
      localStorage.setItem('adonis_db', JSON.stringify(dbCopy));
    } catch (e2) {
      try {
        var dbCopy2 = Object.assign({}, DB);
        dbCopy2.doctors = [];
        dbCopy2.chemists = [];
        dbCopy2.stockists = [];
        dbCopy2.reports = [];
        dbCopy2.tourPlans = [];
        dbCopy2.expenses = [];
        dbCopy2.leaves = [];
        localStorage.setItem('adonis_db', JSON.stringify(dbCopy2));
      } catch(e3) {}
    }
  }
  // Debounce full sync: wait 5 seconds after last saveDB before triggering a full cloud sync.
  // This prevents hammering Supabase with a full sync on every tiny change.
  if (typeof syncSupabaseDatabase === 'function' && !skipSync) {
    if (_saveDBSyncTimer) clearTimeout(_saveDBSyncTimer);
    _saveDBSyncTimer = setTimeout(function() {
      _saveDBSyncTimer = null;
      syncSupabaseDatabase();
    }, 5000);
  }
}

var isSyncing = false;
var syncPending = false;
var hasSyncError = false;
var hasInitializedData = false;
// Track employee IDs that have pending local changes not yet confirmed in Supabase.
// The poller must NOT overwrite these with stale cloud data.
var _pendingDeletedEmpIds = new Set(); // IDs that were deleted locally
var _pendingDeletedDocIds = new Set(); // Doctor tombstones
var _pendingLocalEmpIds = new Set();   // IDs whose data was changed locally (block/unblock/edit)
var _pendingLocalReportIds = new Set(); // Report IDs submitted locally but not yet confirmed in cloud

// Push a single employee record directly to Supabase without triggering a full sync.
// Used by block/unblock to make changes visible in the cloud immediately.
async function pushEmployeeToSupabase(emp) {
  if (!useSupabase || !supabase || !emp || !emp.id) return;
  try {
    var row = {
      id: emp.id,
      account_status: normalizeAccountStatus(emp.accountStatus),
      blocked_date: formatDateForPostgres(emp.blockedDate) || null,
      blocked_reason: emp.blockedReason || null,
      status: normalizeEmployeeStatus(emp.status),
      name: emp.name,
      area: emp.area || '',
      role: emp.role || 'emp',
      manager_id: emp.managerId || null,
      state: emp.state || null,
      designation: typeof emp.designation !== 'undefined' ? (emp.designation || '').trim() : getDefaultEmployeeDesignation(emp.role),
      doj: formatDateForPostgres(emp.doj) || null,
      leaves: Object.assign({}, parseJSONField(emp.leaves), { _designation: typeof emp.designation !== 'undefined' ? (emp.designation || '').trim() : getDefaultEmployeeDesignation(emp.role), _allowedPastDates: emp.allowedPastDates || [] })
    };
    if (emp.pwd) {
      row.pwd = emp.pwd;
    }
    var res = await supabase.from('employees').upsert([row], { onConflict: 'id' });
    if (res && res.error) {
      console.error('pushEmployeeToSupabase error:', res.error);
    } else {
      // Cloud confirmed — remove from pending set
      _pendingLocalEmpIds.delete(String(emp.id).toUpperCase());
      console.log('Employee ' + emp.id + ' pushed to Supabase successfully.');
      showToast('Cloud Sync Complete!', 3000);
    }
  } catch (e) {
    console.error('pushEmployeeToSupabase exception:', e);
  }
}

// Push a single report directly to Supabase immediately after submission.
// Prevents reports from vanishing when the 30-second poller overwrites local data
// before the debounced full sync has had a chance to run.
async function pushReportToSupabase(rep) {
  if (!useSupabase || !supabase || !rep || !rep.id) return;
  try {
    var empId = rep.empId || null;
    if (empId) {
      var mEmp = DB.employees.find(function(x) { return String(x.id||'').toUpperCase() === String(empId).toUpperCase(); });
      empId = mEmp ? mEmp.id : empId;
    }
    var docId = rep.docId || null;
    if (docId === 'UNLISTED') {
      docId = null;
    } else if (docId) {
      var mDoc = DB.doctors.find(function(x) { return String(x.id||'').toUpperCase() === String(docId).toUpperCase(); });
      docId = mDoc ? mDoc.id : docId;
    }
    var chemId = rep.chemId || null;
    if (chemId) {
      var mChem = DB.chemists.find(function(x) { return String(x.id||'').toUpperCase() === String(chemId).toUpperCase(); });
      chemId = mChem ? mChem.id : chemId;
    }
    var jfwMgrId = rep.jfwMgrId || null;
    if (jfwMgrId) {
      var mMgr = DB.employees.find(function(x) { return String(x.id||'').toUpperCase() === String(jfwMgrId).toUpperCase(); });
      jfwMgrId = mMgr ? mMgr.id : jfwMgrId;
    }
    var meta = {
      workType: rep.workType || 'FIELD WORK',
      territory: rep.territory || '',
      city: rep.city || '',
      patch: rep.patch || ''
    };
    var row = {
      id: rep.id,
      emp_id: empId,
      emp_name: rep.empName || '',
      date: formatDateForPostgres(rep.date) || getTodayDateString(),
      time: rep.time || '',
      target_type: rep.targetType || '',
      classification: rep.classification || '',
      call_type: rep.callType || '',
      doc_id: docId,
      doc_name: rep.docName || null,
      doc_spec: rep.docSpec || null,
      doc_area: rep.docArea || null,
      promoted_products: rep.promotedProducts || [],
      samples: JSON.stringify(parseJSONField(rep.samples)),
      gifts: JSON.stringify(parseJSONField(rep.gifts)),
      inputs: JSON.stringify(parseJSONField(rep.inputs)),
      chem_id: chemId,
      chem_name: rep.chemName || null,
      chem_area: rep.chemArea || null,
      stock_id: rep.stockId || null,
      stock_name: rep.stockName || null,
      stock_area: rep.stockArea || null,
      order_amount: rep.orderAmount || 0,
      stock_status: rep.stockStatus || null,
      jfw_mgr_id: jfwMgrId,
      jfw_mgr_name: rep.jfwMgrName || null,
      jfw_remarks: rep.jfwRemarks || null,
      lat: rep.lat || null,
      lng: rep.lng || null,
      remarks: (rep.remarks || '') + '\n===METADATA===\n' + JSON.stringify(meta),
      next_visit: formatDateForPostgres(rep.nextVisit) || null
    };
    var res = await supabase.from('reports').upsert([row], { onConflict: 'id' });
    if (res && res.error) {
      console.error('pushReportToSupabase error:', res.error);
      // Keep it in pending so full sync can retry
    } else {
      _pendingLocalReportIds.delete(String(rep.id));
      console.log('Report ' + rep.id + ' pushed to Supabase successfully.');
      showToast('Cloud Sync Complete!', 3000);
    }
  } catch (e) {
    console.error('pushReportToSupabase exception:', e);
  }
}

// Push a user's inventory tables (samples, gifts, inputs) directly to Supabase.
// Used when reporting a call report so that inventory updates are visible in cloud instantly.
async function pushUserInventoryToSupabase(empId) {
  if (!useSupabase || !supabase || !empId) return;
  
  // Samples
  try {
    var userSamples = (DB.samplesInventory || []).filter(function(s) { return s.empId === empId; });
    const dbSamples = userSamples.map(s => {
      var row = {
        prod_name: s.prodName || '',
        emp_id: empId,
        opening: s.opening || 0,
        received: s.received || 0,
        distributed: s.distributed || 0,
        balance: s.balance || 0
      };
      if (s.id !== undefined && s.id !== null && !String(s.id).startsWith('SAMPLEINV')) {
        row.id = s.id;
      }
      return row;
    });
    if (dbSamples.length > 0) {
      await supabase.from('samples_inventory').upsert(dbSamples);
    }
  } catch(e) {
    console.error("Error pushing user samples inventory:", e);
  }

  // Gifts
  try {
    var userGifts = (DB.giftsInventory || []).filter(function(g) { return g.empId === empId; });
    const dbGifts = userGifts.map(g => {
      var row = {
        gift_name: g.giftName || '',
        emp_id: empId,
        opening: g.opening || 0,
        received: g.received || 0,
        distributed: g.distributed || 0,
        balance: g.balance || 0
      };
      if (g.id !== undefined && g.id !== null && !String(g.id).startsWith('GIFTINV')) {
        row.id = g.id;
      }
      return row;
    });
    if (dbGifts.length > 0) {
      await supabase.from('gifts_inventory').upsert(dbGifts);
    }
  } catch(e) {
    console.error("Error pushing user gifts inventory:", e);
  }

  // Inputs
  try {
    var userInputs = (DB.inputsInventory || []).filter(function(i) { return i.empId === empId; });
    const dbInputs = userInputs.map(i => {
      var row = {
        input_name: i.inputName || '',
        emp_id: empId,
        opening: i.opening || 0,
        received: i.received || 0,
        distributed: i.distributed || 0,
        balance: i.balance || 0
      };
      if (i.id !== undefined && i.id !== null && !String(i.id).startsWith('INPUTINV')) {
        row.id = i.id;
      }
      return row;
    });
    if (dbInputs.length > 0) {
      await supabase.from('inputs_inventory').upsert(dbInputs);
    }
  } catch(e) {
    console.error("Error pushing user inputs inventory:", e);
  }
}

// Persist deleted employee IDs to localStorage so they survive a page reload.
// Without this, if the user reloads before Supabase confirms the delete,
// initSupabaseData fetches the old row and the employee comes back.
function _saveTombstonesToStorage() {
  try {
    localStorage.setItem('adonis_deleted_emp_tombstones', JSON.stringify([..._pendingDeletedEmpIds]));
    localStorage.setItem('adonis_deleted_doc_tombstones', JSON.stringify([..._pendingDeletedDocIds]));
  } catch(e) {}
}

// Load tombstones from previous session (runs once at page load, before initSupabaseData)
(function _loadTombstonesFromStorage() {
  try {
    var saved = JSON.parse(localStorage.getItem('adonis_deleted_emp_tombstones') || '[]');
    saved.forEach(function(id) { _pendingDeletedEmpIds.add(String(id).toUpperCase()); });
    if (saved.length > 0) console.log('Loaded ' + saved.length + ' deleted-employee tombstone(s) from previous session.');
    
    var savedDocs = JSON.parse(localStorage.getItem('adonis_deleted_doc_tombstones') || '[]');
    savedDocs.forEach(function(id) { _pendingDeletedDocIds.add(String(id)); });
    if (savedDocs.length > 0) console.log('Loaded ' + savedDocs.length + ' deleted-doctor tombstone(s).');
  } catch(e) {}
})();

window.addEventListener('beforeunload', function (e) {
  // Only warn if there are UNCONFIRMED critical writes (deletes/blocks not yet pushed to Supabase).
  // Do NOT warn for background full-sync - direct writes handle the important stuff immediately.
  if (_pendingDeletedEmpIds.size > 0 || _pendingLocalEmpIds.size > 0) {
    e.preventDefault();
    e.returnValue = 'Employee changes are still being saved to the cloud. Please wait a moment before leaving.';
  }
});

  async 