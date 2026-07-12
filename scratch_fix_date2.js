const fs = require('fs');
const files = ['index.html', 'live_index.html', 'script_0.js', 'temp_script_0.js', 'temp_script_1.js'];

files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');

  // Let's replace formatDateForPostgres completely with a robust version
  const oldFuncRegex = /function formatDateForPostgres\(dateStr\) \{[\s\S]*?\n\}/;
  
  const newFunc = `function formatDateForPostgres(dateStr) {
  if (!dateStr) return null;
  dateStr = String(dateStr).trim();
  
  if (/^\\d{4}-\\d{2}-\\d{2}$/.test(dateStr)) {
    return dateStr;
  }
  
  // Handle MMDDYYYY or DDMMYYYY (8 digits)
  if (/^\\d{8}$/.test(dateStr)) {
    var d1 = dateStr.substring(0, 2);
    var d2 = dateStr.substring(2, 4);
    var d3 = dateStr.substring(4, 8);
    
    if (parseInt(d1, 10) > 12) {
      return d3 + "-" + d2 + "-" + d1; // DDMMYYYY
    } else if (parseInt(d2, 10) > 12) {
      return d3 + "-" + d1 + "-" + d2; // MMDDYYYY
    }
    // Ambiguous, default to MM-DD-YYYY
    return d3 + "-" + d1 + "-" + d2;
  }
  
  var parts = dateStr.split(/[-/]/);
  if (parts.length === 3) {
    var day = parts[0];
    var month = parts[1];
    var year = parts[2];
    
    if (year.length === 2) {
      year = "20" + year;
    }
    
    if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
      if (day.length === 1) day = "0" + day;
      if (month.length === 1) month = "0" + month;
      
      if (day.length === 4) {
        return day + "-" + month + "-" + year;
      }
      
      if (parseInt(month, 10) > 12 && parseInt(day, 10) <= 12) {
        var temp = month;
        month = day;
        day = temp;
      }
      
      return year + "-" + month + "-" + day;
    }
  }
  
  try {
    var d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      var y = d.getFullYear();
      var m = d.getMonth() + 1;
      var dd = d.getDate();
      return y + '-' + (m < 10 ? '0'+m : m) + '-' + (dd < 10 ? '0'+dd : dd);
    }
  } catch (e) {}
  
  return null;
}`;

  if (oldFuncRegex.test(content)) {
    content = content.replace(oldFuncRegex, newFunc);
    fs.writeFileSync(f, content);
    console.log(f + ' updated');
  } else {
    console.log(f + ' function not found');
  }
});
