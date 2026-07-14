const { createClient } = require('@supabase/supabase-js');

// Try loading environment variables from local .env file if SUPABASE_URL is not set
if (!process.env.SUPABASE_URL) {
  try {
    const fs = require('fs');
    const path = require('path');
    const possiblePaths = [
      path.join(process.cwd(), '.env'),
      path.join(__dirname, '.env'),
      path.join(__dirname, '..', '.env'),
      path.join(__dirname, '..', '..', '.env')
    ];
    for (const envPath of possiblePaths) {
      if (fs.existsSync(envPath)) {
        require('dotenv').config({ path: envPath });
        if (process.env.SUPABASE_URL) {
          console.log(`Loaded environment from ${envPath}`);
          break;
        }
      }
    }
  } catch (e) {
    console.error('Failed to load local .env file:', e);
  }
}

const BLOCK_REASON = 'Final DCR not submitted by 12:00 AM IST';
const EXECUTIVE_EXEMPT_NAMES = new Set(['MILIND SARWATE', 'PANKAJ UNDWAR']);
const WEEKDAY_LABELS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function getISTParts(date = new Date()) {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
  const parts = formatter.formatToParts(date);
  const map = {};
  for (const part of parts) map[part.type] = part.value;
  return {
    year: Number(map.year),
    month: Number(map.month),
    day: Number(map.day),
    hour: Number(map.hour),
    minute: Number(map.minute),
    second: Number(map.second)
  };
}

function formatISTDate(date = new Date()) {
  const ist = getISTParts(date);
  return `${ist.year}-${String(ist.month).padStart(2, '0')}-${String(ist.day).padStart(2, '0')}`;
}

function offsetDate(dateStr, offsetDays) {
  const parts = String(dateStr || '').split('-');
  if (parts.length !== 3) return dateStr;
  
  // Use UTC math to prevent any local timezone interference
  const d = new Date(Date.UTC(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2])));
  d.setUTCDate(d.getUTCDate() + offsetDays);
  
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
}

function normalizeDate(value) {
  if (!value) return null;
  const raw = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? null : formatISTDate(d);
}

function normalizeStatus(value, fallback) {
  return String(value || fallback || '').trim().toUpperCase();
}

function normalizeEmployeeStatus(value) {
  return String(value || 'Active').trim().toLowerCase();
}

function normalizeAccountStatus(value) {
  return String(value || 'ACTIVE').trim().toUpperCase() === 'BLOCKED' ? 'BLOCKED' : 'ACTIVE';
}

function parseJsonField(value) {
  if (!value) return {};
  if (typeof value === 'object') return value;
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch (error) {
    return {};
  }
}

function getAttendanceResetFrom(employee) {
  const leaves = parseJsonField(employee.leaves);
  return normalizeDate(leaves._attendanceResetFrom || '');
}

function getWeeklyOffSet(rows) {
  const map = new Map();
  for (const row of rows || []) {
    const id = String(row.employee_id || '').trim().toUpperCase();
    const weekday = Number(row.weekday);
    if (!id || Number.isNaN(weekday)) continue;
    if (!map.has(id)) map.set(id, new Set());
    map.get(id).add(weekday);
  }
  return map;
}

function getHolidayMap(rows) {
  const map = new Map();
  for (const row of rows || []) {
    const date = normalizeDate(row.date);
    if (!date) continue;
    if (!map.has(date)) map.set(date, []);
    map.get(date).push({
      state: String(row.state || 'All').trim().toLowerCase(),
      name: row.name || ''
    });
  }
  return map;
}

function getApprovedLeaveMap(rows) {
  const map = new Map();
  for (const row of rows || []) {
    const status = normalizeStatus(row.status);
    if (status !== 'APPROVED' && status !== 'APPROVED BY ADMIN') continue;
    const empId = String(row.emp_id || '').trim().toUpperCase();
    const start = normalizeDate(row.start);
    const end = normalizeDate(row.end);
    if (!empId || !start || !end) continue;
    if (!map.has(empId)) map.set(empId, []);
    map.get(empId).push({
      start,
      end,
      type: String(row.type || '')
    });
  }
  return map;
}

function getReportMap(rows) {
  const map = new Map();
  for (const row of rows || []) {
    const empId = String(row.emp_id || '').trim().toUpperCase();
    const date = normalizeDate(row.date);
    if (!empId || !date) continue;
    const key = `${empId}|${date}`;
    if (!map.has(key)) map.set(key, []);
    const parts = String(row.remarks || '').split('\n===METADATA===\n');
    let isFinal = false;
    if (parts.length > 1) {
      try {
        const meta = JSON.parse(parts[1]);
        isFinal = meta && meta.isFinal === true;
      } catch (error) {}
    }
    map.get(key).push({
      is_final: isFinal
    });
  }
  return map;
}

function getAttendanceMap(rows) {
  const map = new Map();
  for (const row of rows || []) {
    const empId = String(row.employee_id || '').trim().toUpperCase();
    const date = normalizeDate(row.date);
    if (!empId || !date) continue;
    map.set(`${empId}|${date}`, row);
  }
  return map;
}

function getHolidayForDateAndState(holidayMap, dateStr, state) {
  const rows = holidayMap.get(dateStr) || [];
  const stateKey = String(state || '').trim().toLowerCase();
  return rows.find((row) => {
    return row.state === 'all' || row.state === 'national' || row.state === stateKey;
  }) || null;
}

function getApprovedLeaveForDate(leaveMap, employeeId, dateStr) {
  const rows = leaveMap.get(String(employeeId || '').trim().toUpperCase()) || [];
  return rows.find((row) => row.start <= dateStr && row.end >= dateStr) || null;
}

function getAttendanceStatusMeta(employee, dateStr, context) {
  const empId = String(employee.id || '').trim().toUpperCase();

  // Rule 1: Final DCR
  const reports = context.reportMap.get(`${empId}|${dateStr}`) || [];
  if (reports.length > 0 && reports.some((row) => !!row.is_final)) {
    return { status: 'P', remarks: 'Present via Final DCR Submission' };
  }

  // Rule 2: Approved Leave
  const approvedLeave = getApprovedLeaveForDate(context.leaveMap, empId, dateStr);
  if (approvedLeave) {
    const leaveType = String(approvedLeave.type || '').toLowerCase();
    return leaveType.includes('sick')
      ? { status: 'SL', remarks: 'Approved Sick Leave' }
      : { status: 'CL', remarks: 'Approved Casual Leave' };
  }

  // Rule 3: Holiday
  const holiday = getHolidayForDateAndState(context.holidayMap, dateStr, employee.state);
  if (holiday) return { status: 'H', remarks: holiday.name ? `Holiday: ${holiday.name}` : 'Holiday' };

  // Rule 4: Weekly Off
  const parts = String(dateStr || '').split('-');
  const weekday = parts.length === 3 ? new Date(Date.UTC(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]))).getUTCDay() : 0;
  const weeklyOffs = context.weeklyOffMap.get(empId);
  if ((weeklyOffs && weeklyOffs.has(weekday)) || (!weeklyOffs && weekday === 0)) {
    return { status: 'WO', remarks: 'Weekly Off' };
  }

  // Rule 5: Absent & Blocked
  return { status: 'A', remarks: `Absent - ${BLOCK_REASON}` };
}

function isAuthorized(req) {
  const cronHeader = req.headers['x-vercel-cron'];
  if (cronHeader) return true;
  const secret = process.env.CRON_SECRET;
  if (!secret) return true;
  const bearer = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  if (bearer && bearer === secret) return true;
  if (req.query && req.query.secret === secret) return true;
  return false;
}

// Fetch all rows from a Supabase table automatically handling pagination
async function fetchAllRows(supabase, queryBuilder) {
  let allRows = [];
  let from = 0;
  const step = 1000;
  while (true) {
    const { data, error } = await queryBuilder.range(from, from + step - 1);
    if (error) throw error;
    if (!data || data.length === 0) break;
    allRows = allRows.concat(data);
    if (data.length < step) break;
    from += step;
  }
  return allRows;
}

module.exports = async (req, res) => {
  if (req.method && req.method !== 'GET' && req.method !== 'POST') {
    res.status(405).json({ ok: false, error: 'Method not allowed' });
    return;
  }
  if (!isAuthorized(req)) {
    res.status(401).json({ ok: false, error: 'Unauthorized' });
    return;
  }
  if (!process.env.SUPABASE_URL || (!process.env.SUPABASE_SERVICE_ROLE_KEY && !process.env.SUPABASE_KEY)) {
    res.status(500).json({ ok: false, error: 'SUPABASE_URL or Key is not configured' });
    return;
  }

  const requestedDate = normalizeDate(req.query && req.query.date);
  const targetDate = requestedDate || offsetDate(formatISTDate(), -1);
  const targetMonth = targetDate.slice(0, 7);
  const dryRun = String((req.query && req.query.dryRun) || '').trim() === '1';
  
  // Use service role key if available for admin operations, fallback to anon key
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;
  const supabase = createClient(process.env.SUPABASE_URL, supabaseKey, {
    auth: { persistSession: false },
    global: {
      headers: {
        'x-employee-id': 'ADMIN',
        'x-employee-password': 'adonis@1234'
      }
    }
  });

  try {
    const [
      employeesRes,
      weeklyOffRes,
      holidaysRes,
      leavesRes,
      reportsRes,
      attendanceRes
    ] = await Promise.all([
      fetchAllRows(supabase, supabase.from('employees').select('id, name, role, doj, state, status, account_status, blocked_date, blocked_reason, leaves').neq('role', 'admin')),
      fetchAllRows(supabase, supabase.from('weekly_off_config').select('employee_id, weekday')),
      fetchAllRows(supabase, supabase.from('holidays').select('date, name, state').eq('date', targetDate)),
      fetchAllRows(supabase, supabase.from('leaves').select('emp_id, type, start, end, status').lte('start', targetDate).gte('end', targetDate)),
      fetchAllRows(supabase, supabase.from('reports').select('emp_id, date, remarks').eq('date', targetDate)),
      fetchAllRows(supabase, supabase.from('attendance').select('id, employee_id, date, login_time, attendance_status, remarks, created_at').eq('date', targetDate))
    ]);

    const context = {
      weeklyOffMap: getWeeklyOffSet(weeklyOffRes),
      holidayMap: getHolidayMap(holidaysRes),
      leaveMap: getApprovedLeaveMap(leavesRes),
      reportMap: getReportMap(reportsRes),
      attendanceMap: getAttendanceMap(attendanceRes)
    };

    const attendanceRows = [];
    const employeesToBlock = [];
    const summary = {
      targetDate,
      scanned: 0,
      blocked: [],
      attendanceUpserts: 0,
      skipped: []
    };

    for (const employee of employeesRes) {
      const empId = String(employee.id || '').trim().toUpperCase();
      if (!empId) continue;
      if (normalizeEmployeeStatus(employee.status) !== 'active') continue;
      if (EXECUTIVE_EXEMPT_NAMES.has(String(employee.name || '').trim().toUpperCase())) {
        summary.skipped.push({ employeeId: empId, reason: 'Executive exempt' });
        continue;
      }
      const doj = normalizeDate(employee.doj);
      if (doj && targetDate < doj) {
        summary.skipped.push({ employeeId: empId, reason: 'Before DOJ' });
        continue;
      }
      const resetFrom = getAttendanceResetFrom(employee);
      if (resetFrom && targetDate < resetFrom) {
        summary.skipped.push({ employeeId: empId, reason: `Reset from ${resetFrom}` });
        continue;
      }

      summary.scanned += 1;
      const statusMeta = getAttendanceStatusMeta(employee, targetDate, context);
      const existingAttendance = context.attendanceMap.get(`${empId}|${targetDate}`);
      const attendanceId = existingAttendance && existingAttendance.id ? existingAttendance.id : `ATT-${empId}-${targetDate}`;
      
      attendanceRows.push({
        id: attendanceId,
        employee_id: employee.id,
        date: targetDate,
        login_time: statusMeta.status === 'P' ? (existingAttendance ? existingAttendance.login_time : null) : null,
        attendance_status: statusMeta.status,
        remarks: statusMeta.remarks,
        created_at: existingAttendance && existingAttendance.created_at ? existingAttendance.created_at : new Date().toISOString()
      });

      if (statusMeta.status === 'A' && normalizeAccountStatus(employee.account_status) !== 'BLOCKED') {
        employeesToBlock.push(employee.id);
        const weekdayParts = targetDate.split('-');
        const weekdayIndex = weekdayParts.length === 3 ? new Date(Date.UTC(Number(weekdayParts[0]), Number(weekdayParts[1]) - 1, Number(weekdayParts[2]))).getUTCDay() : 0;
        summary.blocked.push({
          employeeId: employee.id,
          name: employee.name,
          blockedDate: targetDate,
          reason: BLOCK_REASON,
          weekday: WEEKDAY_LABELS[weekdayIndex]
        });
      }
    }

    if (!dryRun) {
      // Upsert attendance records in batches
      if (attendanceRows.length > 0) {
        const chunkSize = 500;
        for (let i = 0; i < attendanceRows.length; i += chunkSize) {
          const chunk = attendanceRows.slice(i, i + chunkSize);
          const { error } = await supabase.from('attendance').upsert(chunk, { onConflict: 'employee_id, date' });
          if (error) {
             console.error('Error upserting attendance batch:', error);
             throw error;
          }
        }
      }

      // Update blocked employees
      if (employeesToBlock.length > 0) {
        const { error } = await supabase.from('employees')
          .update({
            account_status: 'BLOCKED',
            blocked_date: targetDate,
            blocked_reason: BLOCK_REASON
          })
          .in('id', employeesToBlock);
          
        if (error) {
          console.error('Error blocking employees:', error);
          throw error;
        }
      }
    }

    summary.attendanceUpserts = attendanceRows.length;
    summary.dryRun = dryRun;
    res.status(200).json({ ok: true, ...summary });
  } catch (error) {
    console.error('attendance-midnight cron failed:', error);
    res.status(500).json({
      ok: false,
      error: error.message || 'Unknown error'
    });
  }
};
