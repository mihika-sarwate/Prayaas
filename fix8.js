const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const targetUploadEmployees = `    var hasHeader = isNaN(parseInt(lines[0].charAt(0))) && (lines[0].toLowerCase().indexOf('id') !== -1 || lines[0].toLowerCase().indexOf('name') !== -1);
    var dataLines = hasHeader ? lines.slice(1) : lines;
    dataLines.forEach(function(line){
      var cols=parseCSVLine(line);
      if(!cols[0]||!cols[1])return;
      var pwd = cols[2] || 'pass123';
      var designation = '';
      var rawRole = '';
      var mgrIndex = 5;
      var dojIndex = 6;
      var stateIndex = 7;
      var statusIndex = 8;
      if (cols.length >= 10) {
        designation = cols[4] || '';
        rawRole = (cols[5] || '').trim().toLowerCase();
        mgrIndex = 6;
        dojIndex = 7;
        stateIndex = 8;
        statusIndex = 9;
      } else {
        rawRole = (cols[4] || '').trim().toLowerCase();
      }`;

const replaceUploadEmployees = `    var hasHeader = isNaN(parseInt(lines[0].charAt(0))) && (lines[0].toLowerCase().indexOf('id') !== -1 || lines[0].toLowerCase().indexOf('name') !== -1);
    var isNewFormat = hasHeader && lines[0].toLowerCase().indexOf('designation') !== -1;
    var dataLines = hasHeader ? lines.slice(1) : lines;
    dataLines.forEach(function(line){
      var cols=parseCSVLine(line);
      if(!cols[0]||!cols[1])return;
      var pwd = cols[2] || 'pass123';
      var designation = '';
      var rawRole = '';
      var mgrIndex = 5;
      var dojIndex = 6;
      var stateIndex = 7;
      var statusIndex = 8;
      if (isNewFormat || cols.length >= 10) {
        designation = cols[4] || '';
        rawRole = (cols[5] || '').trim().toLowerCase();
        mgrIndex = 6;
        dojIndex = 7;
        stateIndex = 8;
        statusIndex = 9;
      } else {
        rawRole = (cols[4] || '').trim().toLowerCase();
      }`;

html = html.replace(targetUploadEmployees, replaceUploadEmployees);

// Now fix the syntax error caused by stringify in double quotes
const targetManageBtn = `'<td><button class="btn sm" style="width:auto;display:inline-block;margin-right:4px;padding:0 8px" onclick="openEmployeeStatusModal(' + JSON.stringify(e.id || '') + ')">Manage</button><button class="btn sm danger" style="width:auto;padding:0 8px" onclick="removeEmp(' + JSON.stringify(e.id || '') + ')">Delete</button></td></tr>';`;
const replaceManageBtn = `'<td><button class="btn sm" style="width:auto;display:inline-block;margin-right:4px;padding:0 8px" onclick=\\'openEmployeeStatusModal(' + JSON.stringify(e.id || '') + ')\\'>Manage</button><button class="btn sm danger" style="width:auto;padding:0 8px" onclick=\\'removeEmp(' + JSON.stringify(e.id || '') + ')\\'>Delete</button></td></tr>';`;
html = html.replace(targetManageBtn, replaceManageBtn);

const targetTblNameBtn = `'<td class="tbl-name"><button type="button" class="link-btn" onclick="openEmployeeStatusModal(' + JSON.stringify(e.id || '') + ')">'+(e.name || '')+'</button></td>'`;
const replaceTblNameBtn = `'<td class="tbl-name"><button type="button" class="link-btn" onclick=\\'openEmployeeStatusModal(' + JSON.stringify(e.id || '') + ')\\'>'+(e.name || '')+'</button></td>'`;
html = html.replace(targetTblNameBtn, replaceTblNameBtn);

const targetSetStatusBtns = `'<div class="btn-row" style="flex-wrap:wrap">',
      '<button class="btn warn sm" style="flex:1 1 calc(50% - 6px)" onclick="setEmployeeStatus(' + JSON.stringify(emp.id) + ', ' + JSON.stringify('Hold') + ')">Hold</button>',
      '<button class="btn danger sm" style="flex:1 1 calc(50% - 6px)" onclick="setEmployeeStatus(' + JSON.stringify(emp.id) + ', ' + JSON.stringify('Resign') + ')">Resign</button>',
      '<button class="btn gold sm" style="flex:1 1 calc(50% - 6px)" onclick="setEmployeeStatus(' + JSON.stringify(emp.id) + ', ' + JSON.stringify('Replace') + ')">Replace</button>',
      '<button class="btn success sm" style="flex:1 1 calc(50% - 6px)" onclick="setEmployeeStatus(' + JSON.stringify(emp.id) + ', ' + JSON.stringify('Active') + ')">Active</button>',
    '</div>'`;
const replaceSetStatusBtns = `'<div class="btn-row" style="flex-wrap:wrap">',
      '<button class="btn warn sm" style="flex:1 1 calc(50% - 6px)" onclick=\\'setEmployeeStatus(' + JSON.stringify(emp.id) + ', ' + JSON.stringify('Hold') + ')\\'>Hold</button>',
      '<button class="btn danger sm" style="flex:1 1 calc(50% - 6px)" onclick=\\'setEmployeeStatus(' + JSON.stringify(emp.id) + ', ' + JSON.stringify('Resign') + ')\\'>Resign</button>',
      '<button class="btn gold sm" style="flex:1 1 calc(50% - 6px)" onclick=\\'setEmployeeStatus(' + JSON.stringify(emp.id) + ', ' + JSON.stringify('Replace') + ')\\'>Replace</button>',
      '<button class="btn success sm" style="flex:1 1 calc(50% - 6px)" onclick=\\'setEmployeeStatus(' + JSON.stringify(emp.id) + ', ' + JSON.stringify('Active') + ')\\'>Active</button>',
    '</div>'`;
html = html.replace(targetSetStatusBtns, replaceSetStatusBtns);

fs.writeFileSync('index.html', html, 'utf8');
console.log("Fixed syntax error and upload issue!");
