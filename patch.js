const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');

const t1 = `    <!-- ADMIN DASHBOARD PANEL -->
    <div id="sec-adm-dash">
      <div class="stats">
        <div class="stat"><div class="stat-l">Total Active Team</div><div class="stat-v" id="adm-emp-count">0</div></div>
        <div class="stat"><div class="stat-l">Assigned Doctors</div><div class="stat-v" id="adm-doc-count">0</div></div>`;

const r1 = `    <!-- ADMIN DASHBOARD PANEL -->
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
      <div class="stats">
        <div class="stat"><div class="stat-l">Total Active Team</div><div class="stat-v" id="adm-emp-count">0</div></div>
        <div class="stat"><div class="stat-l">Assigned Doctors</div><div class="stat-v" id="adm-doc-count">0</div></div>`;

const t2 = `  // Reset GPS Status
  document.getElementById('gps-bar').className='gps-bar';
  document.getElementById('gps-text').textContent='Tap to capture GPS location';
  document.getElementById('r-lat').value='';
  document.getElementById('r-lng').value='';
  
  populateReportingDropdowns();
  renderHomeStats();
  goTab('home');
}`;

const r2 = `  // Reset GPS Status
  document.getElementById('gps-bar').className='gps-bar';
  document.getElementById('gps-text').textContent='Tap to capture GPS location';
  document.getElementById('r-lat').value='';
  document.getElementById('r-lng').value='';
  
  populateReportingDropdowns();
  renderHomeStats();
  
  var adminScreen = document.getElementById('scr-admin');
  if (adminScreen && adminScreen.classList.contains('on')) {
    goAdminTab('dash');
  } else {
    goTab('home');
  }
}`;

const t3 = `  document.getElementById('stat-leave-bal').textContent='CL: '+(u.leaves.CL - u.leaves.CL_used)+' | SL: '+(u.leaves.SL - u.leaves.SL_used);
  
  document.getElementById('today-reports').innerHTML=todayR.length ? todayR.map(repRow).join('') : '<div class="empty">No calls reported today</div>';
  document.getElementById('recent-reports').innerHTML=myR.length ? myR.slice(0,5).map(repRow).join('') : '<div class="empty">No reports submitted yet</div>';

  var finalBtnContainer = document.getElementById('final-submit-container');
  if (finalBtnContainer) {
    var hasDrafts = todayR.some(function(r){ return !r.isFinal; });
    finalBtnContainer.style.display = (hasDrafts && todayR.length > 0) ? 'block' : 'none';
  }
}`;

const r3 = `  document.getElementById('stat-leave-bal').textContent='CL: '+(u.leaves.CL - u.leaves.CL_used)+' | SL: '+(u.leaves.SL - u.leaves.SL_used);
  
  var todayHtml = todayR.length ? todayR.map(repRow).join('') : '<div class="empty">No calls reported today</div>';
  var recentHtml = myR.length ? myR.slice(0,5).map(repRow).join('') : '<div class="empty">No reports submitted yet</div>';
  var hasDrafts = todayR.some(function(r){ return !r.isFinal; });
  var displayBtn = (hasDrafts && todayR.length > 0) ? 'block' : 'none';

  if (document.getElementById('today-reports')) document.getElementById('today-reports').innerHTML = todayHtml;
  if (document.getElementById('recent-reports')) document.getElementById('recent-reports').innerHTML = recentHtml;
  if (document.getElementById('final-submit-container')) document.getElementById('final-submit-container').style.display = displayBtn;

  if (document.getElementById('mgr-today-reports')) document.getElementById('mgr-today-reports').innerHTML = todayHtml;
  if (document.getElementById('mgr-recent-reports')) document.getElementById('mgr-recent-reports').innerHTML = recentHtml;
  if (document.getElementById('mgr-final-submit-container')) document.getElementById('mgr-final-submit-container').style.display = displayBtn;
}`;

content = content.replace(t1, r1);
content = content.replace(t2, r2);
content = content.replace(t3, r3);

fs.writeFileSync('index.html', content);
console.log('Edits applied successfully.');
