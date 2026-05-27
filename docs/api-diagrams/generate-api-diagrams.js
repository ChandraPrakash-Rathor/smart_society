const fs = require('fs')
const path = require('path')
const { execFileSync } = require('child_process')

const outDir = __dirname
const chrome = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const htmlOnly = process.argv.includes('--html-only')

const modules = [
  {
    name: 'Auth API',
    base: '/api/auth',
    model: 'User',
    endpoints: [
      ['POST', '/register', 'Public', 'register', ['User.findOne', 'User.create', 'generateToken']],
      ['POST', '/login', 'Public', 'login', ['User.findOne', 'matchPassword', 'generateToken']],
      ['GET', '/me', 'Authenticated', 'getMe', ['req.user']],
      ['PUT', '/me', 'Authenticated', 'updateMe', ['User.findByIdAndUpdate']],
    ],
  },
  {
    name: 'Users API',
    base: '/api/users',
    model: 'User',
    endpoints: [
      ['GET', '/', 'Admin', 'getAllUsers', ['User.find']],
      ['POST', '/', 'Admin', 'createUser', ['User.findOne', 'User.create']],
      ['GET', '/:id', 'Admin', 'getUserById', ['User.findById']],
      ['PUT', '/:id', 'Admin', 'updateUser', ['User.findByIdAndUpdate']],
      ['DELETE', '/:id', 'Admin', 'deleteUser', ['User.findByIdAndDelete']],
    ],
  },
  {
    name: 'Visitors API',
    base: '/api/visitors',
    model: 'Visitor',
    endpoints: [
      ['GET', '/', 'Admin, Resident, Guard', 'getVisitors', ['Visitor.find', 'populate approvedBy']],
      ['POST', '/', 'Admin, Resident, Guard', 'createVisitor', ['Visitor.create']],
      ['GET', '/public/:id', 'Public QR lookup', 'getVisitor', ['Visitor.findById']],
      ['GET', '/:id', 'Admin, Resident, Guard', 'getVisitor', ['Visitor.findById']],
      ['PUT', '/:id', 'Admin, Resident, Guard', 'updateVisitor', ['Visitor.findByIdAndUpdate']],
      ['DELETE', '/:id', 'Admin, Resident, Guard', 'deleteVisitor', ['Visitor.findByIdAndDelete']],
      ['PATCH', '/:id/approve', 'Admin, Guard', 'approveVisitor', ['Visitor.findByIdAndUpdate status=Approved']],
      ['PATCH', '/:id/reject', 'Admin, Guard', 'rejectVisitor', ['Visitor.findByIdAndUpdate status=Rejected']],
    ],
  },
  {
    name: 'Staff API',
    base: '/api/staff',
    model: 'Staff',
    endpoints: [
      ['GET', '/public/:id', 'Public', 'getStaffPublic', ['Staff.findById', 'populate owner']],
      ['POST', '/migrate', 'Admin', 'migrateStaff', ['Staff.updateMany unset user']],
      ['GET', '/', 'Admin, Resident, Guard', 'getStaff', ['Staff.find', 'populate owner']],
      ['POST', '/', 'Admin, Resident', 'createStaff', ['Staff.create owner=req.user']],
      ['GET', '/:id', 'Admin, Resident, Guard', 'getStaffMember', ['Staff.findById']],
      ['PUT', '/:id', 'Admin, Resident', 'updateStaff', ['Staff.findByIdAndUpdate']],
      ['DELETE', '/:id', 'Admin, Resident', 'deleteStaff', ['Staff.findByIdAndDelete']],
    ],
  },
  {
    name: 'Guards API',
    base: '/api/guards',
    model: 'GuardProfile, EntryLog, Visitor',
    endpoints: [
      ['GET', '/', 'Admin', 'getGuards', ['GuardProfile.find']],
      ['GET', '/me', 'Guard', 'getMyProfile', ['GuardProfile.findOne', 'GuardProfile.create if missing']],
      ['PATCH', '/duty', 'Guard', 'toggleDuty', ['GuardProfile.findOne/create', 'save isOnDuty']],
      ['GET', '/stats', 'Guard, Admin', 'getDashboardStats', ['EntryLog.countDocuments']],
      ['GET', '/logs', 'Guard, Admin', 'getEntryLogs', ['EntryLog.find']],
      ['POST', '/logs', 'Guard', 'createEntryLog', ['EntryLog.create']],
      ['PATCH', '/logs/:id', 'Guard, Admin', 'updateEntryLog', ['EntryLog.findByIdAndUpdate']],
      ['GET', '/visitors', 'Guard, Admin', 'getPendingVisitors', ['Visitor.find']],
      ['PATCH', '/visitors/:id/approve', 'Guard, Admin', 'approveVisitor', ['Visitor.findByIdAndUpdate']],
      ['PATCH', '/visitors/:id/reject', 'Guard, Admin', 'rejectVisitor', ['Visitor.findByIdAndUpdate']],
    ],
  },
  {
    name: 'Alerts API',
    base: '/api/alerts',
    model: 'Alert, Notification, User',
    endpoints: [
      ['POST', '/', 'Resident', 'sendAlert', ['Alert.create', 'User.find guards/admins', 'Notification.insertMany', 'sendEmergencyEmail']],
      ['GET', '/', 'Admin, Guard', 'getAlerts', ['Alert.find', 'populate sentBy']],
      ['PATCH', '/:id/resolve', 'Admin, Guard', 'resolveAlert', ['Alert.findByIdAndUpdate resolved=true']],
    ],
  },
  {
    name: 'Complaints API',
    base: '/api/complaints',
    model: 'Complaint',
    endpoints: [
      ['POST', '/', 'Resident', 'createComplaint', ['Complaint.create submittedBy=req.user']],
      ['GET', '/', 'Resident', 'getMyComplaints', ['Complaint.find submittedBy=req.user']],
      ['GET', '/all', 'Admin', 'getAllComplaints', ['Complaint.find', 'populate submittedBy']],
      ['PATCH', '/:id', 'Admin', 'updateComplaint', ['Complaint.findByIdAndUpdate status']],
      ['DELETE', '/:id', 'Resident owner only', 'deleteComplaint', ['Complaint.findOneAndDelete by id and submittedBy']],
    ],
  },
  {
    name: 'Announcements API',
    base: '/api/announcements',
    model: 'Announcement',
    endpoints: [
      ['GET', '/', 'Authenticated all roles', 'getAnnouncements', ['Announcement.find']],
      ['POST', '/', 'Admin', 'createAnnouncement', ['Announcement.create postedBy=req.user']],
      ['PUT', '/:id', 'Admin', 'updateAnnouncement', ['Announcement.findByIdAndUpdate']],
      ['DELETE', '/:id', 'Admin', 'deleteAnnouncement', ['Announcement.findByIdAndDelete']],
      ['PATCH', '/:id/pin', 'Admin', 'togglePin', ['Announcement.findById', 'save pinned toggle']],
    ],
  },
  {
    name: 'Maintenance API',
    base: '/api/maintenance',
    model: 'Maintenance, User',
    endpoints: [
      ['GET', '/my', 'Resident', 'getMyMaintenance', ['Maintenance.find resident=req.user']],
      ['GET', '/', 'Admin', 'getAllMaintenance', ['Maintenance.find', 'populate resident/markedBy']],
      ['GET', '/stats', 'Admin', 'getStats', ['Maintenance.countDocuments', 'Maintenance.aggregate']],
      ['POST', '/', 'Admin', 'createMaintenance', ['Maintenance.create markedBy=req.user']],
      ['POST', '/generate', 'Admin', 'generateBulk', ['User.find residents', 'Maintenance.find existing', 'Maintenance.insertMany']],
      ['PATCH', '/:id', 'Admin', 'updateStatus', ['Maintenance.findByIdAndUpdate', 'paidOn when Paid']],
      ['DELETE', '/:id', 'Admin', 'deleteMaintenance', ['Maintenance.findByIdAndDelete']],
    ],
  },
  {
    name: 'Notifications API',
    base: '/api/notifications',
    model: 'Notification',
    endpoints: [
      ['GET', '/', 'Authenticated user', 'getNotifications', ['Notification.find recipient=req.user']],
      ['PATCH', '/read-all', 'Authenticated user', 'markAllRead', ['Notification.updateMany unread']],
      ['PATCH', '/:id/read', 'Authenticated user', 'markRead', ['Notification.findOneAndUpdate by recipient']],
      ['DELETE', '/:id', 'Authenticated user', 'deleteNotification', ['Notification.findOneAndDelete by recipient']],
    ],
  },
  {
    name: 'Admin Dashboard API',
    base: '/api/admin',
    model: 'User, Visitor, Staff, Complaint, Alert, Maintenance',
    endpoints: [
      ['GET', '/stats', 'Admin', 'getDashboardStats', ['count users/visitors/complaints/alerts', 'Visitor chart', 'Complaint aggregate', 'recent alerts']],
    ],
  },
  {
    name: 'Resident Dashboard API',
    base: '/api/resident',
    model: 'Visitor, Staff, Complaint, Maintenance',
    endpoints: [
      ['GET', '/stats', 'Resident', 'getDashboardStats', ['count resident data', 'recent visitors']],
    ],
  },
  {
    name: 'Chat API',
    base: '/api/chat',
    model: 'Visitor, Staff, Complaint, Maintenance',
    endpoints: [
      ['POST', '/', 'Resident, Admin, Guard', 'chat', ['validate message', 'dynamic DB reply', 'static rule reply', 'fallback reply']],
    ],
  },
]

const classes = [
  ['User', ['name', 'email', 'password', 'role admin|resident|guard', 'phone', 'isActive', 'flat', 'familyMembers[]', 'emergencyContact', 'shift', 'assignedGate']],
  ['Visitor', ['name', 'phone', 'purpose', 'host', 'checkIn', 'checkOut', 'status Pending|Approved|Rejected', 'approvedBy -> User']],
  ['Staff', ['name', 'phone', 'role', 'status Active|Inactive', 'isPresent', 'checkIn', 'checkOut', 'owner -> User']],
  ['GuardProfile', ['user -> User', 'shift', 'isOnDuty', 'patrolLogs[]']],
  ['EntryLog', ['name', 'phone', 'flat', 'status Pending|Inside|Approved|Rejected', 'timeIn', 'timeOut', 'loggedBy -> User']],
  ['Alert', ['sentBy -> User', 'message', 'flat', 'resolved']],
  ['Notification', ['title', 'message', 'type info|warning|alert|success', 'recipient -> User', 'read', 'link']],
  ['Complaint', ['title', 'description', 'category', 'status Open|In Progress|Resolved', 'submittedBy -> User']],
  ['Announcement', ['title', 'body', 'category', 'pinned', 'postedBy -> User']],
  ['Maintenance', ['resident -> User', 'flat', 'month', 'year', 'amount', 'status Paid|Pending|Overdue', 'dueDate', 'paidOn', 'markedBy -> User']],
]

const esc = value => String(value).replace(/[&<>"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]))
const slugFor = value => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
const endpointCount = mods => mods.reduce((sum, mod) => sum + mod.endpoints.length, 0)
const allRoles = mods => [...new Set(mods.flatMap(mod => mod.endpoints.flatMap(ep => ep[2].split(',').map(role => role.trim()).filter(Boolean))))]

function wrapText(text, maxChars = 32) {
  const words = String(text).split(/\s+/)
  const lines = []
  let line = ''
  for (const word of words) {
    if ((line + ' ' + word).trim().length > maxChars && line) {
      lines.push(line)
      line = word
    } else {
      line = (line + ' ' + word).trim()
    }
  }
  if (line) lines.push(line)
  return lines.slice(0, 3)
}

function svgText(x, y, text, opts = {}) {
  const {
    anchor = 'middle',
    size = 12,
    weight = 400,
    fill = '#1f2937',
    family = 'Arial, sans-serif',
    maxChars = 34,
    lineHeight = 14,
  } = opts
  const lines = wrapText(text, maxChars)
  return lines.map((line, idx) => `<text x="${x}" y="${y + idx * lineHeight}" text-anchor="${anchor}" font-size="${size}" font-family="${family}" font-weight="${weight}" fill="${fill}">${esc(line)}</text>`).join('')
}

function sequenceSvg(mod) {
  const lanes = ['Client App', 'Express Route', 'Auth and Role', 'Controller', 'Database / Service', 'API Response']
  const w = 1060             // match page content width
  const rowH = 96
  const headerH = 112
  const h = headerH + mod.endpoints.length * rowH + 48
  const xs = [80, 260, 435, 615, 800, 980]
  let s = `<svg class="diagram" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">`
  s += `<defs><filter id="shadow" x="-10%" y="-10%" width="120%" height="130%"><feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#0f172a" flood-opacity="0.11"/></filter></defs>`
  s += `<rect width="${w}" height="${h}" rx="16" fill="#fbfcfe"/>`
  s += `<rect x="22" y="18" width="${w - 44}" height="${h - 36}" rx="14" fill="#ffffff" stroke="#d9e2ec"/>`
  lanes.forEach((lane, i) => {
    s += `<rect x="${xs[i] - 76}" y="34" width="152" height="42" rx="10" fill="#f1f5f9" stroke="#b7c4d4" filter="url(#shadow)"/>`
    s += svgText(xs[i], 60, lane, { size: 12.5, weight: 700, fill: '#172033', maxChars: 18 })
    s += `<line x1="${xs[i]}" y1="82" x2="${xs[i]}" y2="${h - 34}" stroke="#cbd5e1" stroke-dasharray="5 6"/>`
  })
  const arrow = (x1, y, x2, label, color = '#334155') => {
    const dir = x2 > x1 ? 1 : -1
    s += `<line x1="${x1}" y1="${y}" x2="${x2}" y2="${y}" stroke="${color}" stroke-width="1.7"/>`
    s += `<polygon points="${x2},${y} ${x2 - dir * 8},${y - 4} ${x2 - dir * 8},${y + 4}" fill="${color}"/>`
    s += svgText((x1 + x2) / 2, y - 12, label, { size: 10.5, fill: color, maxChars: 25, lineHeight: 11 })
  }
  mod.endpoints.forEach((ep, idx) => {
    const base = headerH + idx * rowH
    // alternating row background
    if (idx % 2 === 0) s += `<rect x="36" y="${base - 4}" width="${w - 72}" height="${rowH - 4}" rx="10" fill="#f8fafc"/>`
    // 5 arrows evenly spaced within rowH
    const step = Math.floor(rowH / 5)
    arrow(xs[0], base + step * 0 + 10, xs[1], `${ep[0]} ${mod.base}${ep[1]}`, '#1d4ed8')
    arrow(xs[1], base + step * 1 + 10, xs[2], ep[2], '#7c3aed')
    arrow(xs[2], base + step * 2 + 10, xs[3], ep[3], '#0f766e')
    arrow(xs[3], base + step * 3 + 10, xs[4], ep[4].join(', '), '#92400e')
    arrow(xs[4], base + step * 4 + 10, xs[5], 'JSON response', '#047857')
  })
  s += `</svg>`
  return s
}

function activitySvg(mod) {
  const w = 1060             // match page content width
  const colX = 60
  const rowH = 80           // was 72 — more breathing room per endpoint row
  const startY = 280        // was 262 — push rows down so header boxes don't overlap
  const h = startY + mod.endpoints.length * rowH + 90  // extra bottom padding
  let s = `<svg class="diagram" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">`
  s += `<defs><filter id="softShadow" x="-10%" y="-10%" width="120%" height="130%"><feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#0f172a" flood-opacity="0.10"/></filter></defs>`
  s += `<rect width="${w}" height="${h}" rx="16" fill="#fbfcfe"/>`
  s += `<rect x="22" y="18" width="${w - 44}" height="${h - 36}" rx="14" fill="#ffffff" stroke="#d9e2ec"/>`
  const box = (x, y, width, height, text, fill = '#f8fafc', stroke = '#64748b') => {
    s += `<rect x="${x}" y="${y}" width="${width}" height="${height}" rx="10" fill="${fill}" stroke="${stroke}" filter="url(#softShadow)"/>`
    s += svgText(x + width / 2, y + 23, text, { size: 12, weight: 700, fill: '#172033', maxChars: Math.floor(width / 7) })
  }
  // Header flow boxes
  box(422, 42, 276, 44, `${mod.name} workflow`, '#eef6ff', '#2563eb')
  box(422, 112, 276, 44, 'Receive and validate request', '#f8fafc', '#94a3b8')
  s += `<line x1="560" y1="86" x2="560" y2="112" stroke="#64748b"/><polygon points="560,112 555,103 565,103" fill="#64748b"/>`
  box(422, 182, 276, 44, 'Authenticate and check role', '#fff7ed', '#f97316')
  s += `<line x1="560" y1="156" x2="560" y2="182" stroke="#64748b"/><polygon points="560,182 555,173 565,173" fill="#64748b"/>`
  // Endpoint rows
  mod.endpoints.forEach((ep, idx) => {
    const y = startY + idx * rowH
    box(colX, y, 300, 48, `${ep[0]} ${ep[1]}`, '#eef2ff', '#4f46e5')
    box(435, y, 255, 48, ep[3], '#ecfdf5', '#0f766e')
    box(750, y, 300, 48, ep[4].slice(0, 2).join(' + '), '#fff7ed', '#c2410c')
    s += `<line x1="372" y1="${y + 24}" x2="435" y2="${y + 24}" stroke="#64748b"/><polygon points="435,${y + 24} 426,${y + 19} 426,${y + 29}" fill="#64748b"/>`
    s += `<line x1="690" y1="${y + 24}" x2="750" y2="${y + 24}" stroke="#64748b"/><polygon points="750,${y + 24} 741,${y + 19} 741,${y + 29}" fill="#64748b"/>`
  })
  // Bottom response box — always 60px below last row
  const bottomY = startY + mod.endpoints.length * rowH + 16
  box(422, bottomY, 276, 44, 'Return JSON response', '#ecfdf5', '#047857')
  s += `</svg>`
  return s
}

function classSvg(selectedNames = []) {
  const selected = selectedNames.length
    ? classes.filter(([name]) => selectedNames.some(n => n.includes(name) || name.includes(n)))
    : classes
  const list = selected.length ? selected : classes
  const cardW = 230          // compact width
  const cardH = 200          // enough for 11 fields at 13px each
  const gapX = 14
  const gapY = 16
  const cols = 4
  const rows = Math.ceil(list.length / cols)
  // Fixed total width matching A4 landscape content area (~1060px at 96dpi)
  const w = 1060
  const actualCardW = Math.floor((w - 60 - (cols - 1) * gapX) / cols)
  const h = rows * cardH + (rows - 1) * gapY + 40
  let s = `<svg class="diagram" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">`
  s += `<defs><filter id="cardShadow" x="-10%" y="-10%" width="120%" height="130%"><feDropShadow dx="0" dy="1" stdDeviation="1.5" flood-color="#0f172a" flood-opacity="0.08"/></filter></defs>`
  s += `<rect width="${w}" height="${h}" rx="10" fill="#f8fafc"/>`
  list.forEach(([name, fields], i) => {
    const x = 20 + (i % cols) * (actualCardW + gapX)
    const y = 20 + Math.floor(i / cols) * (cardH + gapY)
    s += `<rect x="${x}" y="${y}" width="${actualCardW}" height="${cardH}" rx="8" fill="#ffffff" stroke="#e2e8f0" filter="url(#cardShadow)"/>`
    s += `<path d="M ${x} ${y + 8} Q ${x} ${y} ${x + 8} ${y} H ${x + actualCardW - 8} Q ${x + actualCardW} ${y} ${x + actualCardW} ${y + 8} V ${y + 34} H ${x} Z" fill="#12343b"/>`
    s += `<text x="${x + actualCardW / 2}" y="${y + 22}" text-anchor="middle" font-size="12" font-family="Arial" font-weight="700" fill="#ffffff">${esc(name)}</text>`
    const maxFields = Math.floor((cardH - 44) / 13)
    fields.slice(0, maxFields).forEach((field, idx) => {
      s += `<text x="${x + 10}" y="${y + 48 + idx * 13}" font-size="10" font-family="Arial" fill="#475569">+ ${esc(field)}</text>`
    })
  })
  s += `</svg>`
  return s
}

function endpointTable(mod) {
  return `<table><thead><tr><th>Method</th><th>Endpoint</th><th>Access</th><th>Controller</th><th>Main operations</th></tr></thead><tbody>${mod.endpoints.map(ep => `<tr><td><span class="method method-${ep[0].toLowerCase()}">${ep[0]}</span></td><td><code>${esc(mod.base + ep[1])}</code></td><td>${esc(ep[2])}</td><td><strong>${esc(ep[3])}</strong></td><td>${esc(ep[4].join(' -> '))}</td></tr>`).join('')}</tbody></table>`
}

function cover(title, mods) {
  return `<section class="page cover"><div class="cover-mark">SS</div><p class="eyebrow">Smart Society Management System</p><h1>${esc(title)}</h1><p class="lead">Client-ready backend API documentation with endpoint catalogs, request flows, activity workflows, and database model diagrams.</p><div class="cover-stats"><div><strong>${mods.length}</strong><span>API areas</span></div><div><strong>${endpointCount(mods)}</strong><span>Endpoints</span></div><div><strong>${classes.length}</strong><span>Data models</span></div></div><div class="prepared">Generated from the Express route, controller, and Mongoose model code.</div></section>`
}

function overviewPage(mods) {
  return `<section class="page"><div class="section-kicker">Overview</div><h2>API Scope</h2><p class="section-intro">This document groups the backend into business-friendly API areas. Each area shows who can access it, which controller handles it, and which models or services are touched.</p><div class="summary-grid">${mods.map(mod => `<div class="summary-card"><div class="summary-title">${esc(mod.name)}</div><div class="summary-path">${esc(mod.base)}</div><div class="summary-meta">${mod.endpoints.length} endpoints</div><div class="summary-models">${esc(mod.model)}</div></div>`).join('')}</div><div class="note-box"><strong>Access roles covered:</strong> ${esc(allRoles(mods).join(', '))}</div></section>`
}

function pageHeader(title, subtitle) {
  return `<div class="page-header"><div><div class="section-kicker">API Diagrams</div><h2>${esc(title)}</h2></div>${subtitle ? `<p>${esc(subtitle)}</p>` : ''}</div>`
}

function page(mods, title) {
  const css = `
    @page { size: A4 landscape; margin: 14mm 12mm; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, sans-serif; color: #172033; background: #fff; }
    .page { position: relative; padding: 16px 28px 16px 38px; background: #f7f9fc; border-left: 8px solid #12343b; margin-bottom: 14px; break-inside: avoid; }
    .page:after { content: "Smart Society API Documentation"; display: block; text-align: right; color: #9ca3af; font-size: 8.5px; letter-spacing: .04em; text-transform: uppercase; margin-top: 8px; }
    .cover { border-left: none; padding: 40px 40px 40px 70px; background: linear-gradient(135deg, #12343b 0%, #1f5f63 46%, #f7f9fc 46.2%, #f7f9fc 100%); margin-bottom: 14px; break-inside: avoid; }
    .cover:after { display: none; }
    .cover-mark { width: 56px; height: 56px; border-radius: 14px; background: #ffffff; color: #12343b; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 22px; margin-bottom: 16px; box-shadow: 0 8px 20px rgba(15,23,42,.18); }
    .eyebrow, .section-kicker { margin: 0 0 4px; font-size: 9.5px; color: #0f766e; letter-spacing: .14em; text-transform: uppercase; font-weight: 800; }
    .cover .eyebrow { color: #cce8e6; }
    h1 { max-width: 520px; font-size: 34px; line-height: 1.05; margin: 0 0 10px; color: #ffffff; }
    h2 { font-size: 20px; line-height: 1.1; margin: 0 0 2px; color: #12343b; }
    h3 { font-size: 13px; margin: 8px 0 4px; color: #334155; }
    p { font-size: 11px; color: #526173; line-height: 1.35; }
    .lead { max-width: 480px; color: #e7f5f4; font-size: 13px; line-height: 1.4; margin: 0 0 16px; }
    .cover-stats { display: flex; gap: 10px; margin: 4px 0 18px; }
    .cover-stats div { width: 118px; padding: 10px; border-radius: 10px; background: rgba(255,255,255,.94); }
    .cover-stats strong { display: block; color: #12343b; font-size: 20px; line-height: 1; }
    .cover-stats span { display: block; margin-top: 3px; color: #526173; font-size: 9.5px; text-transform: uppercase; letter-spacing: .07em; font-weight: 700; }
    .prepared { color: #d9efed; font-size: 10px; }
    .page-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; margin-bottom: 8px; padding-bottom: 8px; border-bottom: 1px solid #d8e0ea; }
    .page-header p { max-width: 380px; margin: 1px 0 0; text-align: right; font-size: 10px; color: #64748b; }
    .section-intro { max-width: 820px; margin: 4px 0 8px; font-size: 11px; }
    .summary-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
    .summary-card { padding: 10px; border: 1px solid #d7e0ea; border-radius: 8px; background: #ffffff; }
    .summary-title { font-size: 12px; color: #12343b; font-weight: 800; margin-bottom: 4px; }
    .summary-path { font-family: Menlo, Consolas, monospace; color: #0f766e; font-size: 9.5px; margin-bottom: 6px; }
    .summary-meta { display: inline-block; padding: 2px 6px; border-radius: 999px; background: #eef6ff; color: #1d4ed8; font-size: 9px; font-weight: 800; text-transform: uppercase; }
    .summary-models { margin-top: 6px; color: #64748b; font-size: 10px; line-height: 1.3; }
    .note-box { margin-top: 8px; padding: 8px 10px; border-left: 3px solid #0f766e; background: #ffffff; border-radius: 6px; color: #475569; font-size: 10.5px; }
    .meta-row { display: flex; gap: 6px; margin: 6px 0 8px; }
    .pill { display: inline-flex; align-items: center; padding: 3px 8px; border-radius: 999px; background: #ffffff; border: 1px solid #d7e0ea; color: #475569; font-size: 10px; font-weight: 700; }
    table { width: 100%; border-collapse: separate; border-spacing: 0; font-size: 9.5px; margin: 4px 0 8px; background: #ffffff; border: 1px solid #d7e0ea; border-radius: 8px; overflow: hidden; }
    th, td { border-bottom: 1px solid #e5ebf2; padding: 5px 7px; vertical-align: top; }
    tr:last-child td { border-bottom: 0; }
    th { background: #12343b; color: #ffffff; text-align: left; font-size: 9px; text-transform: uppercase; letter-spacing: .06em; }
    td:nth-child(2) { width: 200px; }
    td:nth-child(5) { color: #526173; }
    code { font-family: Menlo, Consolas, monospace; font-size: 9px; color: #12343b; }
    .method { display: inline-block; min-width: 42px; text-align: center; padding: 2px 5px; border-radius: 999px; font-weight: 800; font-size: 8.5px; color: #ffffff; }
    .method-get { background: #2563eb; }
    .method-post { background: #0f766e; }
    .method-put { background: #7c3aed; }
    .method-patch { background: #c2410c; }
    .method-delete { background: #b91c1c; }
    .diagram { display: block; width: 100%; height: auto; margin: 4px 0 0; max-height: 480px; }
    svg.diagram { overflow: visible; }
  `
  return `<!doctype html><html><head><meta charset="utf-8"><title>${esc(title)}</title><style>${css}</style></head><body>${cover(title, mods)}${overviewPage(mods)}<section class="page">${pageHeader('Global Class Diagram', 'Domain entities and primary references used by the complete backend.')}${classSvg()}</section>${mods.map(mod => `<section class="page">${pageHeader(mod.name, 'Endpoint catalog with access role, controller action, and backend operation summary.')}<div class="meta-row"><span class="pill">Base: ${esc(mod.base)}</span><span class="pill">Endpoints: ${mod.endpoints.length}</span><span class="pill">Models: ${esc(mod.model)}</span></div>${endpointTable(mod)}</section><section class="page">${pageHeader(`${mod.name} Sequence Diagram`, 'How a request moves from the client through routing, authorization, controller logic, persistence, and response.')}${sequenceSvg(mod)}</section><section class="page">${pageHeader(`${mod.name} Activity Diagram`, 'High-level workflow for each endpoint in this API area.')}${activitySvg(mod)}</section><section class="page">${pageHeader(`${mod.name} Class Diagram`, 'Models and services most relevant to this API area.')}${classSvg(mod.model.split(',').map(s => s.trim()))}</section>`).join('')}</body></html>`
}

function writePdf(htmlPath, pdfPath) {
  if (htmlOnly) return
  execFileSync(chrome, [
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    '--no-pdf-header-footer',
    `--print-to-pdf=${pdfPath}`,
    `file://${htmlPath}`,
  ], { stdio: 'pipe' })
}

function generateHtmlAndChromePdfs() {
  const allHtml = path.join(outDir, 'smart-society-api-diagrams.html')
  const allPdf  = path.join(outDir, 'smart-society-api-diagrams.pdf')
  fs.writeFileSync(allHtml, page(modules, 'Smart Society API Diagrams'))
  writePdf(allHtml, allPdf)

  for (const mod of modules) {
    const slug     = slugFor(mod.name)
    const htmlPath = path.join(outDir, `${slug}-diagrams.html`)
    const pdfPath  = path.join(outDir, `${slug}-diagrams.pdf`)
    fs.writeFileSync(htmlPath, page([mod], `${mod.name} Diagrams`))
    writePdf(htmlPath, pdfPath)
  }

function generateHtmlAndChromePdfs() {
  const allHtml = path.join(outDir, 'smart-society-api-diagrams.html')
  const allPdf = path.join(outDir, 'smart-society-api-diagrams.pdf')
  fs.writeFileSync(allHtml, page(modules, 'Smart Society API Diagrams'))
  writePdf(allHtml, allPdf)

  for (const mod of modules) {
    const slug = slugFor(mod.name)
    const htmlPath = path.join(outDir, `${slug}-diagrams.html`)
    const pdfPath = path.join(outDir, `${slug}-diagrams.pdf`)
    fs.writeFileSync(htmlPath, page([mod], `${mod.name} Diagrams`))
    writePdf(htmlPath, pdfPath)
  }

  const index = `# Smart Society API Diagrams

Generated PDFs:

- [Complete API diagrams](smart-society-api-diagrams.pdf)
${modules.map(mod => {
  const slug = slugFor(mod.name)
  return `- [${mod.name} diagrams](${slug}-diagrams.pdf)`
}).join('\n')}

Each PDF contains endpoint catalog, sequence diagram, activity diagram, and class diagram pages.
`
  fs.writeFileSync(path.join(outDir, 'README.md'), index)
}

if (require.main === module) {
  generateHtmlAndChromePdfs()
}

module.exports = { modules, classes, slugFor, endpointCount, allRoles, wrapText, outDir }
