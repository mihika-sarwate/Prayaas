const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const jsMatch = html.match(/<script>([\s\S]*?)<\/script>/);
if (!jsMatch) throw new Error("No script found");
const js = jsMatch[1];

const mockJs = `
const document = {
  getElementById: (id) => ({ value: "EX", innerHTML: "", style: {}, appendChild: () => {}, textContent: "" }),
  createElement: () => ({ style: {} }),
  querySelectorAll: () => []
};
const window = { addEventListener: () => {} };
var SESSION = { user: { id: "ADLA149", role: "emp" } };
var DB = {
  doctors: [
    { assignTo: "ADLA149", status: "Active", territoryType: "EX", city: "Datia", area: "Some Area" },
    { assignTo: "ADLA42", status: "Active", territoryType: "HQ", city: "", area: "" }
  ],
  employees: [],
  reports: [],
  tourPlans: [],
  expenses: [],
  leaves: []
};
var $ = () => ({ hide: ()=>{}, show: ()=>{}, on: ()=>{}, select2: ()=>{}, removeClass: ()=>{}, val: ()=>()=>{} });

${js.replace(/window\.addEventListener/g, '(() => {})')}

populateReportTerritoryDropdowns();
populateReportCityPatch();
console.log("Towns By Territory:", window._mrTownsByTerritory);
`;

fs.writeFileSync('temp.js', mockJs);
