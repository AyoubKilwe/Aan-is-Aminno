import { useEffect, useRef, useState } from 'react'
import Icon from '../components/Icon.jsx'
import { NavBar } from '../components/UI.jsx'
import { askAdvisor, hasKey } from '../lib/gemini.js'

// Tiny formatter: **bold**, *italic*, line breaks. React escapes the text.
function Rich({ text }) {
  return text.split('\n').map((l) => l.replace(/^\s*[*-]\s+/, '• ')).filter((l, i, a) => l.trim() || (i > 0 && a[i - 1].trim())).map((line, i) => (
    <p key={i}>
      {line.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g).map((part, j) =>
        part.startsWith('**') ? <b key={j}>{part.slice(2, -2)}</b>
          : part.startsWith('*') && part.length > 2 && !part.startsWith('* ') ? <i key={j}>{part.slice(1, -1)}</i>
          : part,
      )}
    </p>
  ))
}

export default function Advisor({ t, lang, group, businesses, agreements, invested, chat, setChat, pendingQuestion, clearPending }) {
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
    const res = await askAdvisor({ group, businesses, agreements, invested, lang, history, question: q })
    setChat((c) => [...c, { role: 'ai', text: res.text, error: res.error }])
    setBusy(false)
  }

  // A business page sent a question here.
  useEffect(() => {
    if (pendingQuestion && sentPending.current !== pendingQuestion) {
      sentPending.current = pendingQuestion
      clearPending()
      send(pendingQuestion)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingQuestion])

  useEffect(() => {
    if (chat.length) endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [chat, busy])

  return (
    <>
      <NavBar
        title={t('adv_title')}
        trailing={chat.length > 0 && <button className="nav-btn" onClick={() => setChat([])}>{t('adv_clear')}</button>}
      />
      <main className="screen">
        <h1 className="large-title">{t('adv_title')}</h1>
        <div className="ai-note">
          <Icon name="sparkle" size={16} />
          <span>{t('adv_ai')}{!hasKey() && <><br />{t('adv_offline')}</>}</span>
        </div>

        {chat.length === 0 && (
          <>
            <p className="secondary" style={{ margin: '16px 4px 10px' }}>{t('adv_empty')}</p>
            <div className="suggestions">
              {['adv_q1', 'adv_q2', 'adv_q3'].map((k) => (
                <button key={k} className="suggestion" onClick={() => send(t(k))}>
                  <Icon name="sparkle" size={18} /> {t(k)}
                </button>
              ))}
            </div>
          </>
        )}

        <div className="chat" aria-live="polite">
          {chat.map((m, i) => (
            <div key={i} className={`bubble ${m.role}`}>
              <Rich text={m.text} />
              {m.error && <p className="footnote">{t('adv_error')}</p>}
            </div>
          ))}
          {busy && <div className="bubble ai typing" aria-label={t('adv_thinking')}><span /><span /><span /></div>}
          {chat.length > 0 && !busy && (
            <div className="suggestions" style={{ marginTop: 8 }}>
              {['adv_q2', 'adv_q3'].map((k) => (
                <button key={k} className="suggestion" onClick={() => send(t(k))}><Icon name="sparkle" size={18} /> {t(k)}</button>
              ))}
            </div>
          )}
          <div ref={endRef} />
        </div>
      </main>

      <form className="composer" onSubmit={(e) => { e.preventDefault(); send(input) }}>
        <input value={input} onChange={(e) => setInput(e.target.value)} placeholder={t('adv_placeholder')} aria-label={t('adv_placeholder')} enterKeyHint="send" />
        <button className="send-btn" disabled={busy || !input.trim()} aria-label={t('adv_send')}><Icon name="send" size={18} /></button>
      </form>
    </>
  )
}
