const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');
const literalN = String.fromCharCode(92) + 'n';
const targetString = literalN + "                         '<option value=\"INDUCTION DAY\"'";
if (content.includes(targetString)) {
  content = content.split(targetString).join('\\n' + "                         '<option value=\"INDUCTION DAY\"'");
  fs.writeFileSync('index.html', content);
  console.log('Fixed line 8350');
} else {
  console.log('Target string not found');
}
