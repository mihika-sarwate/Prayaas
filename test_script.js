function parseCSVLine(text) {
  var ret = [];
  var inQuote = false;
  var val = '';
  for (var i = 0; i < text.length; i++) {
    var c = text[i];
    if (inQuote) {
      if (c === '"') {
        if (i + 1 < text.length && text[i + 1] === '"') {
          val += '"';
          i++;
        } else {
          inQuote = false;
        }
      } else {
        val += c;
      }
    } else {
      if (c === '"') {
        inQuote = true;
      } else if (c === ',') {
        ret.push(val.trim());
        val = '';
      } else {
        val += c;
      }
    }
  }
  ret.push(val.trim());
  return ret;
}

var lines = 'EmployeeID,Name,Password,Territory,Designation,Role,ManagerID,DOJ,State,Status\r\nADLA01,PANKAJ UNDWAR,ADLA01,MUMBAI,CEO,manager,NONE,09-01-2025,Maharashtra,Active'.split(/\r?\n/);
var h = parseCSVLine(lines[0]).map(function(s){return s.trim().toLowerCase();});
console.log('Headers:', h);

var idCol=0, nameCol=1, pwdCol=2, terrCol=3, desigCol=4, roleCol=5, mgrCol=6, dojCol=7, stateCol=8, statusCol=9;
if (h.length > 0) {
  h.forEach(function(h, idx) {
    if (h === 'id' || h === 'employee id' || h === 'employeeid' || h === 'code') idCol = idx;
    else if (h.indexOf('name') !== -1) nameCol = idx;
    else if (h.indexOf('password') !== -1 || h === 'pwd') pwdCol = idx;
    else if (h.indexOf('territory') !== -1 || h === 'area') terrCol = idx;
    else if (h.indexOf('designation') !== -1) desigCol = idx;
    else if (h.indexOf('role') !== -1) roleCol = idx;
    else if (h.indexOf('manager') !== -1) mgrCol = idx;
    else if (h.indexOf('doj') !== -1 || h.indexOf('joining') !== -1) dojCol = idx;
    else if (h.indexOf('state') !== -1) stateCol = idx;
    else if (h.indexOf('status') !== -1) statusCol = idx;
  });
}
console.log('Cols:', {idCol, nameCol, pwdCol, terrCol, desigCol, roleCol, mgrCol, dojCol, stateCol, statusCol});
