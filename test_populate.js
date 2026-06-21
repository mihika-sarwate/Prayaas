
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

function populateReportTerritoryDropdowns() {
  if (!SESSION.user) return;
  var teamIds = (SESSION.user.role === 'emp') ? [] : null;
  if (teamIds) {
    teamIds.push(SESSION.user.id);
  }
  
  var mrTownsByTerritory = { 'HQ': new Set(), 'EX': new Set(), 'OS': new Set() };
  var mrAreasByTerritory = { 'HQ': new Set(), 'EX': new Set(), 'OS': new Set() };
  
  DB.doctors.forEach(function(d) {
    var assignedList = String(d.assignTo || '').toUpperCase().split(',').map(function(s){return s.trim();});
    var teamIdsUpper = teamIds ? teamIds.map(function(id) { return String(id).toUpperCase(); }) : null;
    var isAssignedToTeam = teamIdsUpper ? assignedList.some(function(a){ return teamIdsUpper.includes(a); }) : true;
    
    if (isAssignedToTeam && d.status === 'Active') {
      var tType = (d.territoryType || '').trim().toUpperCase();
      if (tType) {
        if (!mrTownsByTerritory[tType]) mrTownsByTerritory[tType] = new Set();
        if (d.city) mrTownsByTerritory[tType].add(d.city.trim());
        if (!mrAreasByTerritory[tType]) mrAreasByTerritory[tType] = new Set();
        if (d.area) mrAreasByTerritory[tType].add(d.area.trim());
      }
    }
  });

  var areaToTType = {};
  Object.keys(mrAreasByTerritory).forEach(function(tt) {
    mrAreasByTerritory[tt].forEach(function(a) {
      if (!areaToTType[a]) areaToTType[a] = [];
      areaToTType[a].push(tt);
    });
  });

  DB.chemists.forEach(function(c) {
    var assignedList = String(c.assignTo || '').toUpperCase().split(',').map(function(s){return s.trim();});
    var teamIdsUpper = teamIds ? teamIds.map(function(id) { return String(id).toUpperCase(); }) : null;
    var isAssignedToTeam = teamIdsUpper ? assignedList.some(function(a){ return teamIdsUpper.includes(a); }) : true;

    if (isAssignedToTeam && c.area) {
      var cArea = c.area.trim();
      var tTypes = areaToTType[cArea];
      if (tTypes && tTypes.length > 0) {
        tTypes.forEach(function(tt) {
          mrAreasByTerritory[tt].add(cArea);
          if (c.city) mrTownsByTerritory[tt].add(c.city.trim());
        });
      } else {
        mrAreasByTerritory['HQ'].add(cArea);
        if (c.city) mrTownsByTerritory['HQ'].add(c.city.trim());
      }
    }
  });
  
  window._mrTownsByTerritory = mrTownsByTerritory;
  window._mrAreasByTerritory = mrAreasByTerritory;
  
  populateReportCityPatch();
}
populateReportTerritoryDropdowns();
console.log("Towns By Territory:", window._mrTownsByTerritory);
