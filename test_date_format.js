const d = new Date("2026-07-11T18:30:00.000Z");
const parts = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Kolkata',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit'
}).formatToParts(d);
const map = {};
for (let i = 0; i < parts.length; i++) {
  map[parts[i].type] = parts[i].value;
}
console.log(map.year + '-' + map.month + '-' + map.day);
