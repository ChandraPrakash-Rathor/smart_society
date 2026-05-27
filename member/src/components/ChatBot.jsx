import { useEffect, useRef, useState } from 'react'
import { MessageCircle, X, Send, Bot, User, Loader2 } from 'lucide-react'
import axiosInstance from '../utils/axiosInstance'

// ── Parse markdown-like bold (**text**) ───────────────────────────────────────
function ParsedText({ text }) {
  const parts = text.split(/\*\*(.*?)\*\*/g)
  return (
    <span>
      {parts.map((p, i) =>
        i % 2 === 1
          ? <strong key={i} className="font-bold">{p}</strong>
          : <span key={i}>{p}</span>
      )}
    </span>
  )
}

// ── Message bubble ────────────────────────────────────────────────────────────
function Message({ msg }) {
  const isBot = msg.role === 'bot'
  return (
    <div className={`flex gap-2 ${isBot ? 'items-start' : 'items-start flex-row-reverse'}`}>
      {/* Avatar */}
      <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5
        ${isBot ? 'bg-brand-600' : 'bg-brand-200'}`}>
        {isBot
          ? <Bot size={14} className="text-white" />
          : <User size={14} className="text-brand-700" />}
      </div>

      {/* Bubble */}
      <div className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-line
        ${isBot
          ? 'bg-brand-50 border border-brand-100 text-brand-900 rounded-tl-sm'
          : 'bg-brand-600 text-white rounded-tr-sm'}`}>
        {isBot ? <ParsedText text={msg.text} /> : msg.text}
        <p className={`text-xs mt-1 ${isBot ? 'text-brand-400' : 'text-white/60'}`}>
          {msg.time}
        </p>
      </div>
    </div>
  )
}

// ── Quick reply chips ─────────────────────────────────────────────────────────
const quickReplies = [
  'How many visitors?',
  'Pending visitors',
  'My complaints',
  'Maintenance bills',
  'My staff',
  'Emergency help',
]

// ── Main ChatBot ──────────────────────────────────────────────────────────────
export default function ChatBot() {
  const [open, setOpen]       = useState(false)
  const [input, setInput]     = useState('')
  const [loading, setLoading] = useState(false)
  const [unread, setUnread]   = useState(1)
  const [messages, setMessages] = useState([
    {
      id: 1, role: 'bot',
      text: '👋 Hi! I\'m your Smart Society assistant.\n\nAsk me anything about visitors, staff, complaints, or maintenance. Type **"help"** to see all options.',
      time: 'Just now',
    },
  ])

  const bottomRef = useRef(null)
  const inputRef  = useRef(null)

  // Auto scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setUnread(0)
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [open])

  const now = () => new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })

  const sendMessage = async (text) => {
    const userMsg = text || input.trim()
    if (!userMsg) return
    setInput('')

    // Add user message
    setMessages(prev => [...prev, { id: Date.now(), role: 'user', text: userMsg, time: now() }])
    setLoading(true)

    try {
      const { data } = await axiosInstance.post('/chat', { message: userMsg })
      setMessages(prev => [...prev, { id: Date.now() + 1, role: 'bot', text: data.reply, time: now() }])
    } catch {
      setMessages(prev => [...prev, {
        id: Date.now() + 1, role: 'bot',
        text: '⚠️ Sorry, I\'m having trouble connecting. Please try again.',
        time: now(),
      }])
    } finally {
      setLoading(false)
    }
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
  }

  return (
    <>
      {/* ── Chat Window ── */}
      {open && (
        <div className="fixed bottom-20 right-5 z-50 w-80 sm:w-96 flex flex-col
          bg-white rounded-2xl shadow-2xl shadow-brand-950/20 border border-brand-100
          animate-[modalIn_0.2s_ease-out]"
          style={{ height: '520px' }}>

          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3.5 bg-brand-600 rounded-t-2xl">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
              <Bot size={18} className="text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-white">Society Assistant</p>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <p className="text-xs text-white/70">Online · Always here to help</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)}
              className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/20 hover:bg-white/30 transition">
              <X size={14} className="text-white" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-white">
            {messages.map(msg => <Message key={msg.id} msg={msg} />)}

            {/* Typing indicator */}
            {loading && (
              <div className="flex gap-2 items-start">
                <div className="w-7 h-7 rounded-full bg-brand-600 flex items-center justify-center flex-shrink-0">
                  <Bot size={14} className="text-white" />
                </div>
                <div className="bg-brand-50 border border-brand-100 rounded-2xl rounded-tl-sm px-4 py-3">
                  <div className="flex gap-1 items-center">
                    <span className="w-2 h-2 rounded-full bg-brand-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 rounded-full bg-brand-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 rounded-full bg-brand-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick replies */}
          <div className="px-3 py-2 border-t border-brand-50 flex gap-1.5 overflow-x-auto scrollbar-hide">
            {quickReplies.map(q => (
              <button key={q} onClick={() => sendMessage(q)}
                className="flex-shrink-0 text-xs font-medium text-brand-600 bg-brand-50 hover:bg-brand-100
                  border border-brand-200 px-3 py-1.5 rounded-full transition whitespace-nowrap">
                {q}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="px-3 pb-3 pt-1">
            <div className="flex items-center gap-2 bg-brand-50 border border-brand-200 rounded-xl px-3 py-2
              focus-within:ring-2 focus-within:ring-brand-300 focus-within:border-brand-400 transition">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Type a message..."
                className="flex-1 bg-transparent text-sm text-brand-900 placeholder:text-brand-300 outline-none"
              />
              <button onClick={() => sendMessage()} disabled={!input.trim() || loading}
                className="w-7 h-7 flex items-center justify-center rounded-lg bg-brand-600 hover:bg-brand-700
                  disabled:opacity-40 disabled:cursor-not-allowed transition flex-shrink-0">
                {loading
                  ? <Loader2 size={13} className="text-white animate-spin" />
                  : <Send size={13} className="text-white" />}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Floating Button ── */}
      <button
        onClick={() => setOpen(o => !o)}
        className="fixed bottom-5 right-5 z-50 w-14 h-14 rounded-full bg-brand-600 hover:bg-brand-700
          active:scale-95 shadow-xl shadow-brand-400/40 flex items-center justify-center transition-all duration-200">
        {open
          ? <X size={22} className="text-white" />
          : <MessageCircle size={22} className="text-white" />}

        {/* Unread badge */}
        {!open && unread > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-xs font-bold flex items-center justify-center">
            {unread}
          </span>
        )}
      </button>
    </>
  )
}
