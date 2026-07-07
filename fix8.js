const fs = require('fs');
let c = fs.readFileSync('index.html', 'utf8');

const persistAssignCode = `
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
`;

// Insert the functions right before "function saveDB"
c = c.replace('function saveDB(skipSync)', persistAssignCode + '\nfunction saveDB(skipSync)');

// Patch saveDoctor
c = c.replace("doc.assignTo=document.getElementById('md-assign').value;", "doc.assignTo=document.getElementById('md-assign').value;\n      persistLocalAssignTo('doctors', doc.id, doc.assignTo);");
c = c.replace("assignTo: document.getElementById('md-assign').value,", "assignTo: document.getElementById('md-assign').value,");
let newDocStr = "DB.doctors.push({\n      id: docId,";
c = c.replace(newDocStr, newDocStr + "\n      _dummy: persistLocalAssignTo('doctors', docId, document.getElementById('md-assign').value),");

// Patch saveChemist
c = c.replace("chem.assignTo=document.getElementById('mc-assign').value;", "chem.assignTo=document.getElementById('mc-assign').value;\n      persistLocalAssignTo('chemists', chem.id, chem.assignTo);");
let newChemStr = "DB.chemists.push({\n      id: chemId,";
c = c.replace(newChemStr, newChemStr + "\n      _dummy: persistLocalAssignTo('chemists', chemId, document.getElementById('mc-assign').value),");

// Patch saveStockist
c = c.replace("stk.assignTo=document.getElementById('ms-assign').value;", "stk.assignTo=document.getElementById('ms-assign').value;\n      persistLocalAssignTo('stockists', stk.id, stk.assignTo);");
let newStkStr = "DB.stockists.push({\n      id: stkId,";
c = c.replace(newStkStr, newStkStr + "\n      _dummy: persistLocalAssignTo('stockists', stkId, document.getElementById('ms-assign').value),");

// Call restore inside initializeApp where DB is loaded
c = c.replace("DB.doctors = localDB.doctors || [];", "DB.doctors = localDB.doctors || [];\n    restoreLocalAssignTo('doctors', DB.doctors);");
c = c.replace("DB.chemists = localDB.chemists || [];", "DB.chemists = localDB.chemists || [];\n    restoreLocalAssignTo('chemists', DB.chemists);");
c = c.replace("DB.stockists = localDB.stockists || [];", "DB.stockists = localDB.stockists || [];\n    restoreLocalAssignTo('stockists', DB.stockists);");

// For Supabase DB loading
c = c.replace("if (cloudDocs.length === 0 && localDocs.length > 0) {", "restoreLocalAssignTo('doctors', cloudDocs);\n        if (cloudDocs.length === 0 && localDocs.length > 0) {");
c = c.replace("if (cloudChems.length === 0 && localChems.length > 0) {", "restoreLocalAssignTo('chemists', cloudChems);\n        if (cloudChems.length === 0 && localChems.length > 0) {");
c = c.replace("if (cloudStockists.length === 0 && localStockists.length > 0) {", "restoreLocalAssignTo('stockists', cloudStockists);\n        if (cloudStockists.length === 0 && localStockists.length > 0) {");

// Clear pending after sync finishes
c = c.replace("await upsertInBatches('doctors', dbDocs);", "await upsertInBatches('doctors', dbDocs);\n      clearLocalAssignTo('doctors');");
c = c.replace("await upsertInBatches('chemists', dbChems);", "await upsertInBatches('chemists', dbChems);\n      clearLocalAssignTo('chemists');");
c = c.replace("await upsertInBatches('stockists', dbStockists);", "await upsertInBatches('stockists', dbStockists);\n      clearLocalAssignTo('stockists');");

fs.writeFileSync('index.html', c);
console.log('Safe persist logic injected');
