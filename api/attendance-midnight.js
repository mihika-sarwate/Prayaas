const pg = require('pg');
const { Client } = pg;

// FIX: Ensure Postgres DATE columns are returned as exact strings (YYYY-MM-DD)
// and not parsed into JS Date objects which get mangled by timezone offsets.
pg.types.setTypeParser(1082, function(stringValue) {
  return stringValue;
});


if (!process.env.DATABASE_URL) {
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
        const envContent = fs.readFileSync(envPath, 'utf8');
        const match = envContent.match(/DATABASE_URL\s*=\s*([^\r\n]*)/);
        if (match) {
          process.env.DATABASE_URL = match[1].trim();
          console.log(`Loaded DATABASE_URL from ${envPath}`);
          break;
        }
      }
    }
  } catch (e) {
    console.error('Failed to load local .env file:', e);
  }
}
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = "postgresql://postgres.mmxdvruucggeixjqwsqr:Adonisgroma%402026@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres";
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

function parseLocalMidnight(dateStr) {
  const parts = String(dateStr || '').split('-');
  if (parts.length !== 3) return new Date(dateStr);
  return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
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

function getTourPlanDayMap(rows) {
  const map = new Map();
  for (const row of rows || []) {
    const status = normalizeStatus(row.status);
    if (!['APPROVED', 'APPROVED BY MANAGER', 'APPROVED BY ADMIN'].includes(status)) continue;
    const empId = String(row.emp_id || '').trim().toUpperCase();
    const month = String(row.month || '').trim();
    const days = Array.isArray(row.days) ? row.days : parseJsonField(row.days);
    if (!empId || !month || !Array.isArray(days)) continue;
    for (const day of days) {
      const date = normalizeDate(day && day.date);
      if (!date) continue;
      map.set(`${empId}|${date}`, day);
    }
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



// PHASE 1: NEW STRICT BUSINESS RULES IMPLEMENTATION
function getAttendanceStatusMeta(employee, dateStr, context) {
  const empId = String(employee.id || '').trim().toUpperCase();

  // Rule 1: DCR submission (any report counts as reporting)
  const reports = context.reportMap.get(`${empId}|${dateStr}`) || [];
  if (reports.length > 0) {
    return { status: 'P', remarks: 'Present via DCR Submission' };
  }

  // Rule 2: Tour Plan (Overrides general rules)
  const tpDay = context.tourPlanDayMap.get(`${empId}|${dateStr}`);
  if (tpDay) {
    const wt = String(tpDay.workType || '').toUpperCase();
    if (wt === 'WEEKLY OFF') return { status: 'WO', remarks: 'Weekly Off (from Tour Plan)' };
    if (wt === 'HOLIDAY') return { status: 'H', remarks: 'Holiday (from Tour Plan)' };
    if (wt === 'LEAVE') {
      const tpLeave = getApprovedLeaveForDate(context.leaveMap, empId, dateStr);
      if (tpLeave) {
        const leaveType = String(tpLeave.type || '').toLowerCase();
        if (leaveType.includes('sick')) {
          return { status: 'SL', remarks: 'Approved Sick Leave (from Tour Plan)' };
        } else if (leaveType.includes('casual')) {
          return { status: 'CL', remarks: 'Approved Casual Leave (from Tour Plan)' };
        } else if (leaveType.includes('privilege') || leaveType.includes('paid') || leaveType === 'pl') {
          return { status: 'PL', remarks: 'Approved Paid/Privilege Leave (from Tour Plan)' };
        } else if (leaveType.includes('earned') || leaveType === 'el') {
          return { status: 'EL', remarks: 'Approved Earned Leave (from Tour Plan)' };
        }
      }
      return { status: 'CL', remarks: 'Approved Leave (from Tour Plan)' };
    }
  }

  // Rule 3: Approved Leave
  const approvedLeave = getApprovedLeaveForDate(context.leaveMap, empId, dateStr);
  if (approvedLeave) {
    const leaveType = String(approvedLeave.type || '').toLowerCase();
    if (leaveType.includes('sick')) {
      return { status: 'SL', remarks: 'Approved Sick Leave' };
    } else if (leaveType.includes('casual')) {
      return { status: 'CL', remarks: 'Approved Casual Leave' };
    } else if (leaveType.includes('privilege') || leaveType.includes('paid') || leaveType === 'pl') {
      return { status: 'PL', remarks: 'Approved Paid/Privilege Leave' };
    } else if (leaveType.includes('earned') || leaveType === 'el') {
      return { status: 'EL', remarks: 'Approved Earned Leave' };
    } else {
      return { status: 'CL', remarks: 'Approved Leave' };
    }
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

  // Rule 6: Absent & Blocked
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

module.exports = async (req, res) => {
  if (req.method && req.method !== 'GET' && req.method !== 'POST') {
    res.status(405).json({ ok: false, error: 'Method not allowed' });
    return;
  }
  if (!isAuthorized(req)) {
    res.status(401).json({ ok: false, error: 'Unauthorized' });
    return;
  }
  if (!process.env.DATABASE_URL) {
    res.status(500).json({ ok: false, error: 'DATABASE_URL is not configured' });
    return;
  }

  const requestedDate = normalizeDate(req.query && req.query.date);
  const targetDate = requestedDate || offsetDate(formatISTDate(), -1);
  const targetMonth = targetDate.slice(0, 7);
  const dryRun = String((req.query && req.query.dryRun) || '').trim() === '1';
  const dbUrl = process.env.DATABASE_URL.replace(':5432', ':6543');
  const client = new Client({ connectionString: dbUrl, connectionTimeoutMillis: 30000 });

  try {
    await client.connect();

    const employeesRes = await client.query(`
      SELECT id, name, role, doj, state, status, account_status, blocked_date, blocked_reason, leaves
      FROM employees
      WHERE role <> 'admin'
    `);
    const weeklyOffRes = await client.query(`SELECT employee_id, weekday FROM weekly_off_config`);
    const holidaysRes = await client.query(`SELECT date, name, state FROM holidays WHERE date = $1`, [targetDate]);
    const leavesRes = await client.query(`
      SELECT emp_id, type, start, "end", status
      FROM leaves
      WHERE start <= $1 AND "end" >= $1
    `, [targetDate]);
    const reportsRes = await client.query(`
      SELECT emp_id, date, remarks
      FROM reports
      WHERE date = $1
    `, [targetDate]);
    const attendanceRes = await client.query(`
      SELECT id, employee_id, date, login_time, attendance_status, remarks, created_at
      FROM attendance
      WHERE date = $1
    `, [targetDate]);
    const tourPlansRes = await client.query(`
      SELECT emp_id, month, status, days
      FROM tour_plans
      WHERE month = $1
    `, [targetMonth]);

    const context = {
      weeklyOffMap: getWeeklyOffSet(weeklyOffRes.rows),
      holidayMap: getHolidayMap(holidaysRes.rows),
      leaveMap: getApprovedLeaveMap(leavesRes.rows),
      reportMap: getReportMap(reportsRes.rows, targetDate),
      attendanceMap: getAttendanceMap(attendanceRes.rows),
      tourPlanDayMap: getTourPlanDayMap(tourPlansRes.rows)
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

    for (const employee of employeesRes.rows) {
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
      await client.query('BEGIN');

      if (attendanceRows.length > 0) {
        await client.query(`
          INSERT INTO attendance (id, employee_id, date, login_time, attendance_status, remarks, created_at)
          SELECT x.id, x.employee_id, x.date::date, x.login_time, x.attendance_status, x.remarks, x.created_at::timestamptz
          FROM jsonb_to_recordset($1::jsonb) AS x(
            id text,
            employee_id text,
            date text,
            login_time text,
            attendance_status text,
            remarks text,
            created_at text
          )
          ON CONFLICT (employee_id, date)
          DO UPDATE SET
            login_time = EXCLUDED.login_time,
            attendance_status = EXCLUDED.attendance_status,
            remarks = EXCLUDED.remarks
        `, [JSON.stringify(attendanceRows)]);
      }

      if (employeesToBlock.length > 0) {
        await client.query(`
          UPDATE employees
          SET account_status = 'BLOCKED',
              blocked_date = $2::date,
              blocked_reason = $3
          WHERE id = ANY($1::text[])
        `, [employeesToBlock, targetDate, BLOCK_REASON]);
      }

      await client.query('COMMIT');
    }

    summary.attendanceUpserts = attendanceRows.length;
    summary.dryRun = dryRun;
    res.status(200).json({ ok: true, ...summary });
  } catch (error) {
    try {
      await client.query('ROLLBACK');
    } catch (rollbackError) {}
    console.error('attendance-midnight cron failed:', error);
    res.status(500).json({
      ok: false,
      error: error.message || 'Unknown error'
    });
  } finally {
    await client.end().catch(() => {});
  }
};
