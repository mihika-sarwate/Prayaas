const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');

// Add _pendingLocalDocIds
content = content.replace(/var _pendingLocalEmpIds = new Set\(\);\s*\/\/ IDs whose data was changed locally \(block\/unblock\/edit\)/, 'var _pendingLocalEmpIds = new Set();\nvar _pendingLocalDocIds = new Set();\nvar _pendingLocalChemIds = new Set();\nvar _pendingLocalStockistIds = new Set();');

// In initializeApp fetch
const docReplace = `        var cloudDocs = (doctors || [])
          .filter(function(d) { return !_pendingDeletedDocIds.has(String(d.id)); })
          .map(d => {
            var existing = DB && DB.doctors ? DB.doctors.find(x => x.id === d.id) : null;
            if (_pendingLocalDocIds.has(String(d.id)) && existing) {
              return Object.assign({}, existing);
            }`;
content = content.replace(/        var cloudDocs = \(doctors \|\| \[\]\)\s*\.filter\(function\(d\) \{ return !_pendingDeletedDocIds\.has\(String\(d\.id\)\); \}\)\s*\.map\(d => \(\{/g, docReplace + '\n            id: d.id,');
// It might be easier to use the exact string replacement.
// Let's use a simpler regex or exact match
