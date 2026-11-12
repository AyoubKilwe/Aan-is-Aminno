import { useEffect, useRef, useState } from 'react'
import { askAdvisor, hasKey } from '../lib/gemini.js'

// Tiny formatter: **bold**, *italic*, line breaks. Text is escaped by React.
function Rich({ text }) {
  return text.split('\n').map((line, i) => (
    <p key={i}>
      {line.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g).map((part, j) =>
        part.startsWith('**') ? <b key={j}>{part.slice(2, -2)}</b>
          : part.startsWith('*') && part.length > 2 ? <i key={j}>{part.slice(1, -1)}</i>
          : part,
      )}
    </p>
  ))
}

export default function Advisor({ t, lang, group, businesses, chat, setChat, pendingQuestion, clearPending }) {
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const endRef = useRef(null)
  const sentPending = useRef(null)

  const send = async (question) => {
    const q = question.trim()
    if (!q || busy) return
    setInput('')
    const history = chat.slice(-10)
    setChat((c) => [...c, { role: 'user', text: q }])
    setBusy(true)
    const res = await askAdvisor({ group, businesses, lang, history, question: q })
    setChat((c) => [...c, { role: 'ai', text: res.text, offline: res.offline, error: res.error }])
    setBusy(false)
  }

  // A card on the Opportunities page sent a question here.
  useEffect(() => {
    if (pendingQuestion && sentPending.current !== pendingQuestion) {
      sentPending.current = pendingQuestion
      clearPending()
      send(pendingQuestion)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingQuestion])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chat, busy])

  return (
    <div className="page advisor">
      <h1>🤖 {t('adv_title')}</h1>
      <p className="muted">{t('adv_sub')}</p>
      {!hasKey() && <p className="note">ℹ️ {t('adv_offline')}</p>}

      <div className="quick">
        {['adv_q1', 'adv_q2', 'adv_q3'].map((k) => (
          <button key={k} className="chip" onClick={() => send(t(k))} disabled={busy}>{t(k)}</button>
        ))}
      </div>

      <div className="chat">
        {chat.map((m, i) => (
          <div key={i} className={`msg ${m.role}`}>
            <Rich text={m.text} />
            {m.error && <small className="muted">{t('adv_error')}</small>}
          </div>
        ))}
        {busy && <div className="msg ai typing">{t('adv_thinking')}</div>}
        <div ref={endRef} />
      </div>

      <form className="composer" onSubmit={(e) => { e.preventDefault(); send(input) }}>
        <input value={input} onChange={(e) => setInput(e.target.value)} placeholder={t('adv_placeholder')} />
        <button className="btn primary" disabled={busy || !input.trim()}>{t('adv_send')}</button>
      </form>
    </div>
  )
}
