const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const jsMatch = html.match(/<script>([\s\S]*?)<\/script>/)[1];

const mockJs = `
const window = { _mrTownsByTerritory: {}, _mrAreasByTerritory: {} };
const document = { getElementById: () => null };
const SESSION = { user: { id: 'ADLA33', role: 'emp' } };
const DB = {
  doctors: [
    { assignTo: 'ADLA33', status: 'Active', territoryType: 'HQ', city: 'Guwahati', area: 'Guwahati' },
    { assignTo: 'ADLA33', status: 'Active', territoryType: 'EX', city: 'Boko', area: 'Boko' },
    { assignTo: 'ADLA33', status: 'Inactive', territoryType: 'HQ', city: 'Test', area: 'Test' }
  ],
  chemists: []
};

function populateReportCityPatch() {
  console.log("Called populateReportCityPatch");
}

` + jsMatch.match(/function populateReportTerritoryDropdowns\(\) \{[\s\S]*?\n\}/)[0] + `
populateReportTerritoryDropdowns();
console.log("Towns By Territory:", window._mrTownsByTerritory);
`;

fs.writeFileSync('test_populate.js', mockJs);
