const Visitor     = require('../visitor/Visitor')
const Staff       = require('../staff/Staff')
const Complaint   = require('../complaint/Complaint')
const Maintenance = require('../maintenance/Maintenance')

// ── Rule-based bot responses ──────────────────────────────────────────────────
const staticReplies = [
  { patterns: ['hello','hi','hey','namaste','hii'],
    reply: '👋 Hello! I\'m your Smart Society assistant. How can I help you today?\n\nYou can ask me about:\n• Visitors\n• Staff\n• Complaints\n• Maintenance bills\n• Emergency help' },

  { patterns: ['bye','goodbye','thanks','thank you','ok bye'],
    reply: '👋 Goodbye! Stay safe. Feel free to ask anytime.' },

  { patterns: ['help','what can you do','options','menu'],
    reply: '🤖 I can help you with:\n\n1️⃣ **Visitors** — "how many visitors", "pending visitors"\n2️⃣ **Staff** — "my staff", "active staff"\n3️⃣ **Complaints** — "my complaints", "open complaints"\n4️⃣ **Maintenance** — "pending bills", "maintenance status"\n5️⃣ **Emergency** — "emergency", "help me"\n6️⃣ **Society** — "gate status", "society info"' },

  { patterns: ['emergency','help me','danger','fire','accident','sos'],
    reply: '🚨 **Emergency detected!**\n\nPlease use the **Emergency Alert 🚨** button on your Dashboard immediately.\n\nThis will instantly notify all guards and admins.\n\n📞 You can also call the guard directly.' },

  { patterns: ['gate','gate status','main gate','entry'],
    reply: '🚪 The main gate is currently **Open**.\n\nGuards are on duty 24/7. For visitor entry, please pre-approve them from the Visitors section.' },

  { patterns: ['maintenance fee','bill','payment','due','pending bill'],
    reply: '💰 You can check your maintenance bills in the **Maintenance** section.\n\nIf you have pending bills, please pay before the due date to avoid overdue charges.' },

  { patterns: ['complaint','issue','problem','water','electricity','lift'],
    reply: '📝 You can raise a complaint from the **Help Desk** section.\n\nCategories available:\n• Water\n• Security\n• Maintenance\n• Electricity\n• Other\n\nYour complaint will be reviewed by the admin.' },

  { patterns: ['visitor','guest','delivery','cab'],
    reply: '👥 You can manage visitors from the **Visitors** section.\n\n• Add a new visitor\n• Generate QR code for approved visitors\n• Share QR on WhatsApp\n• Track visitor status' },

  { patterns: ['staff','maid','cook','driver','cleaner','gardener'],
    reply: '👷 You can manage your household staff from the **Staff** section.\n\n• Add staff members\n• Generate staff QR cards\n• Track active/inactive status' },

  { patterns: ['announcement','notice','news','update'],
    reply: '📢 Check the **Announcements** section for the latest society updates, events, and notices from the admin.' },

  { patterns: ['profile','account','my details','my info'],
    reply: '👤 You can view and edit your profile from the **Profile** section.\n\nYou can update your name, phone number, and other details.' },

  { patterns: ['qr','qr code','scan'],
    reply: '📱 QR codes are available for:\n\n• **Visitors** — Click the green QR button on any visitor row\n• **Staff** — Click the green QR button on any staff row\n\nShare the QR on WhatsApp so the guard can scan it at the gate.' },

  { patterns: ['society','about','smart society','what is'],
    reply: '🏢 **Smart Society Management System**\n\nA complete platform for:\n• Residents to manage visitors & staff\n• Guards to monitor gate entry\n• Admin to oversee everything\n\nBuilt with MERN Stack 🚀' },
]

// ── Dynamic replies using DB data ─────────────────────────────────────────────
const getDynamicReply = async (message, userId, userFlat) => {
  const msg = message.toLowerCase()

  // Visitor count
  if (msg.includes('how many visitor') || msg.includes('visitor count') || msg.includes('total visitor')) {
    const total   = await Visitor.countDocuments({ host: userFlat })
    const pending = await Visitor.countDocuments({ host: userFlat, status: 'Pending' })
    return `👥 You have **${total} total visitors**.\n\n⏳ **${pending} pending** approval.\n\nGo to Visitors section to manage them.`
  }

  // Pending visitors
  if (msg.includes('pending visitor') || msg.includes('visitor pending') || msg.includes('approve visitor')) {
    const visitors = await Visitor.find({ host: userFlat, status: 'Pending' }).limit(3).select('name purpose')
    if (visitors.length === 0) return '✅ No pending visitors right now!'
    const list = visitors.map(v => `• ${v.name} (${v.purpose})`).join('\n')
    return `⏳ **${visitors.length} pending visitor(s):**\n\n${list}\n\nGo to Visitors section to approve them.`
  }

  // Staff count
  if (msg.includes('my staff') || msg.includes('staff count') || msg.includes('how many staff')) {
    const total  = await Staff.countDocuments()
    const active = await Staff.countDocuments({ status: 'Active' })
    return `👷 You have **${total} staff members**.\n\n✅ **${active} active** right now.\n\nGo to Staff section to manage them.`
  }

  // Complaints
  if (msg.includes('my complaint') || msg.includes('complaint status') || msg.includes('open complaint')) {
    const open     = await Complaint.countDocuments({ submittedBy: userId, status: 'Open' })
    const resolved = await Complaint.countDocuments({ submittedBy: userId, status: 'Resolved' })
    return `📝 Your complaints:\n\n🔴 **${open} open**\n✅ **${resolved} resolved**\n\nGo to Help Desk to view details.`
  }

  // Maintenance
  if (msg.includes('maintenance') || msg.includes('pending bill') || msg.includes('due bill')) {
    const pending = await Maintenance.countDocuments({ resident: userId, status: 'Pending' })
    const overdue = await Maintenance.countDocuments({ resident: userId, status: 'Overdue' })
    if (pending === 0 && overdue === 0) return '✅ All your maintenance bills are paid! Great job 🎉'
    return `💰 Maintenance status:\n\n⏳ **${pending} pending**\n🔴 **${overdue} overdue**\n\nPlease pay before the due date to avoid penalties.`
  }

  return null
}

// @desc   Chat bot endpoint
// @route  POST /api/chat
// @access Resident
const chat = async (req, res) => {
  try {
    const { message } = req.body
    if (!message?.trim()) return res.status(400).json({ message: 'Message is required' })

    const msg = message.toLowerCase().trim()

    // 1. Try dynamic DB-based reply first
    const dynamicReply = await getDynamicReply(msg, req.user._id, req.user.flat)
    if (dynamicReply) return res.json({ reply: dynamicReply, type: 'dynamic' })

    // 2. Try static pattern matching
    for (const rule of staticReplies) {
      if (rule.patterns.some(p => msg.includes(p))) {
        return res.json({ reply: rule.reply, type: 'static' })
      }
    }

    // 3. Default fallback
    res.json({
      reply: `🤔 I'm not sure about that. Here's what I can help with:\n\n• Type **"help"** to see all options\n• Ask about visitors, staff, complaints, or maintenance\n• Type **"emergency"** for urgent help`,
      type: 'fallback',
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

module.exports = { chat }
