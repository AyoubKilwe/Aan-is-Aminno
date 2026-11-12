import { useEffect, useRef, useState } from 'react'
import Icon from './Icon.jsx'
import Rich from './Rich.jsx'
import { askAdvisor } from '../lib/gemini.js'
import { SEED_BUSINESSES, DEFAULT_GROUP } from '../data/businesses.js'

const COPY = {
  en: {
    open: 'Ask AI',
    title: 'Aan Is Aamino AI',
    status: 'Answers in Somali or English',
    hello: 'Hi! Ask me anything about investing your hagbad, halal business, or how this app works.',
    q1: 'How does the trust score work?',
    q2: 'What business can we start with $4,000?',
    q3: 'What is a Mudaraba agreement?',
    ph: 'Type your question',
    close: 'Close',
    send: 'Send',
    note: 'AI can make mistakes.',
  },
  so: {
    open: 'Weydii AI',
    title: 'Aan Is Aamino AI',
    status: 'Af-Soomaali ama Ingiriis',
    hello: 'Soo dhawoow! I weydii wax kasta oo ku saabsan maalgelinta hagbaddaada, ganacsi xalaal ah, ama sida app-kan u shaqeeyo.',
    q1: 'Dhibcaha kalsoonidu sidee bay u shaqeeyaan?',
    q2: 'Ganacsi noocee ah ayaan ku bilaabi karnaa $4,000?',
    q3: 'Waa maxay heshiiska Mudaaraba?',
    ph: 'Su’aashaada qor',
    close: 'Xidh',
    send: 'Dir',
    note: 'AI-gu wuu khaldami karaa.',
  },
}

// Floating AI assistant for the landing page. Uses the same advisor as the app,
// with the demo group and the local listings as context.
export default function AIWidget({ lang }) {
  const c = COPY[lang] || COPY.en
  const [open, setOpen] = useState(false)
  const [chat, setChat] = useState([])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const endRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => { if (open) inputRef.current?.focus() }, [open])
  useEffect(() => { endRef.current?.scrollIntoView({ block: 'end' }) }, [chat, busy])
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  const send = async (text) => {
    const q = text.trim()
    if (!q || busy) return
    setInput('')
    const history = chat.slice(-10)
    setChat((m) => [...m, { role: 'user', text: q }])
    setBusy(true)
    const res = await askAdvisor({ group: DEFAULT_GROUP, businesses: SEED_BUSINESSES, lang, history, question: q })
    setChat((m) => [...m, { role: 'ai', text: res.text }])
    setBusy(false)
  }

  return (
    <>
      {open && (
        <div className="aiw-panel" role="dialog" aria-label={c.title}>
          <div className="aiw-head">
            <span className="aiw-avatar"><Icon name="sparkle" size={20} /></span>
            <div className="aiw-head-text">
              <b>{c.title}</b>
              <span><i className="aiw-dot" /> {c.status}</span>
            </div>
            <button className="aiw-x" onClick={() => setOpen(false)} aria-label={c.close}><Icon name="close" size={20} /></button>
          </div>

          <div className="aiw-body" aria-live="polite">
            <div className="bubble ai"><p>{c.hello}</p></div>
            {chat.length === 0 && (
              <div className="aiw-suggest">
                {[c.q1, c.q2, c.q3].map((q) => (
                  <button key={q} onClick={() => send(q)}>{q}</button>
                ))}
              </div>
            )}
            {chat.map((m, i) => (
              <div key={i} className={`bubble ${m.role}`}><Rich text={m.text} /></div>
            ))}
            {busy && <div className="bubble ai typing"><span /><span /><span /></div>}
            <div ref={endRef} />
          </div>

          <form className="aiw-form" onSubmit={(e) => { e.preventDefault(); send(input) }}>
            <input ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)} placeholder={c.ph} aria-label={c.ph} enterKeyHint="send" />
            <button className="send-btn" disabled={busy || !input.trim()} aria-label={c.send}><Icon name="send" size={18} /></button>
          </form>
          <div className="aiw-note">{c.note}</div>
        </div>
      )}

      <button className={`aiw-fab ${open ? 'is-open' : ''}`} onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-label={open ? c.close : c.open}>
        <Icon name={open ? 'close' : 'sparkle'} size={26} />
        {!open && <span className="aiw-fab-label">{c.open}</span>}
      </button>
    </>
  )
}
