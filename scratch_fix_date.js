const fs = require('fs');
const files = ['index.html', 'live_index.html', 'script_0.js', 'temp_script_0.js', 'temp_script_1.js'];

files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');

  // We are going to replace:
  // if (day.length === 4) { return day + "-" + month + "-" + year; }
  // return year + "-" + month + "-" + day;

  // Let's just find `return year + "-" + month + "-" + day;` and replace it with:
  // if (parseInt(month, 10) > 12 && parseInt(day, 10) <= 12) { var temp = month; month = day; day = temp; }
  // return year + "-" + month + "-" + day;
  
  if (content.includes('return year + "-" + month + "-" + day;')) {
    if (!content.includes('var temp = month;')) {
      content = content.replace(
        'return year + "-" + month + "-" + day;',
        'if (parseInt(month, 10) > 12 && parseInt(day, 10) <= 12) { var temp = month; month = day; day = temp; }\n      return year + "-" + month + "-" + day;'
      );
      fs.writeFileSync(f, content);
      console.log(f + ' updated');
    } else {
      console.log(f + ' already updated');
    }
  } else {
    console.log(f + ' target not found');
  }
});
