const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');

// Normalize line endings to avoid \r\n vs \n issues
content = content.replace(/\r\n/g, '\n');

// 1. Add manager today reports section to dashboard
content = content.replace(
  /<!-- ADMIN DASHBOARD PANEL -->\n\s*<div id="sec-adm-dash">\n\s*<div class="stats">/,
  `<!-- ADMIN DASHBOARD PANEL -->
    <div id="sec-adm-dash">
      <div class="card manager-only" style="margin-bottom: 20px;">
        <div class="card-title">&#128197; My Today's Schedule &amp; Activity</div>
        <div id="mgr-today-reports"><div class="empty">No calls reported today</div></div>
        <div id="mgr-final-submit-container" style="margin-top:10px;text-align:right;display:none;">
          <button class="btn primary" onclick="finalSubmitToday()">Submit Final Report for Today</button>
        </div>
      </div>
      <div class="card manager-only" style="margin-bottom: 20px;">
        <div class="card-title">&#128203; My Recent Calls</div>
        <div id="mgr-recent-reports"><div class="empty">No reports submitted yet</div></div>
      </div>
      <div class="stats">`
);

// 2. Update saveReport navigation
content = content.replace(
  /populateReportingDropdowns\(\);\n\s*renderHomeStats\(\);\n\s*goTab\('home'\);\n\}/,
  `populateReportingDropdowns();
  renderHomeStats();
  var adminScreen = document.getElementById('scr-admin');
  if (adminScreen && adminScreen.classList.contains('on')) {
    goAdminTab('dash');
  } else {
    goTab('home');
  }
}`
);

// 3. Update renderHomeStats to populate manager elements
const regex3 = /document\.getElementById\('today-reports'\)\.innerHTML=([^;]+);\n\s*document\.getElementById\('recent-reports'\)\.innerHTML=([^;]+);\n\s*var finalBtnContainer = document\.getElementById\('final-submit-container'\);\n\s*if \(finalBtnContainer\) \{\n\s*var hasDrafts = todayR\.some\(function\(r\)\{ return !r\.isFinal; \}\);\n\s*finalBtnContainer\.style\.display = \(hasDrafts && todayR\.length > 0\) \? 'block' : 'none';\n\s*\}/;

content = content.replace(
  regex3,
  `var todayHtml = $1;
  var recentHtml = $2;
  var hasDrafts = todayR.some(function(r){ return !r.isFinal; });
  var displayBtn = (hasDrafts && todayR.length > 0) ? 'block' : 'none';

  if (document.getElementById('today-reports')) document.getElementById('today-reports').innerHTML = todayHtml;
  if (document.getElementById('recent-reports')) document.getElementById('recent-reports').innerHTML = recentHtml;
  if (document.getElementById('final-submit-container')) document.getElementById('final-submit-container').style.display = displayBtn;

  if (document.getElementById('mgr-today-reports')) document.getElementById('mgr-today-reports').innerHTML = todayHtml;
  if (document.getElementById('mgr-recent-reports')) document.getElementById('mgr-recent-reports').innerHTML = recentHtml;
  if (document.getElementById('mgr-final-submit-container')) document.getElementById('mgr-final-submit-container').style.display = displayBtn;
}`
);

fs.writeFileSync('index.html', content);
console.log('Edits applied successfully.');
