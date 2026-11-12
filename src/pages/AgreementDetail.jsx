import { useState } from 'react'
import Icon from '../components/Icon.jsx'
import { NavBar } from '../components/UI.jsx'
import { fmt } from '../lib/trustScore.js'
import { contractText } from '../lib/contract.js'
import { formatDate } from '../lib/date.js'

export default function AgreementDetail({ t, lang, group, agr, onBack, onPayment }) {
  const [value, setValue] = useState('')
  const [copied, setCopied] = useState(false)
  const got = agr.payments.reduce((s, p) => s + p.amount, 0)
  const pct = Math.min(100, Math.round((got / agr.amount) * 100))
  const text = contractText({ lang, group, a: agr })
  const dateFmt = (d) => formatDate(d, lang, true)

  const add = (e) => {
    e.preventDefault()
    const n = Math.round(Number(value))
    if (n > 0) { onPayment(n); setValue('') }
  }

  const copy = async () => {
    try { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500) } catch { /* ignore */ }
  }

  return (
    <>
      <NavBar title={agr.businessName} onBack={onBack} backLabel={t('tab_agr')} />
      <main className="screen narrow">
        <h1 className="title2" style={{ margin: '4px 0 2px' }}>{agr.businessName}</h1>
        <p className="footnote" style={{ margin: 0 }}>{t('agr_started', { d: dateFmt(agr.date) })} · {agr.owner}</p>

        <div className="money-card" style={{ marginTop: 16 }}>
          <div className="label">{t('agr_back_of', { b: fmt(agr.amount) })}</div>
          <div className="big tnum" style={{ marginBottom: 8 }}>{fmt(got)}</div>
          <div className="meter" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} style={{ background: 'rgba(255,255,255,0.2)' }}><div style={{ width: `${pct}%`, background: '#fbbf24' }} /></div>
          <div className="label" style={{ marginTop: 10 }}>{t('agr_group')} {agr.share}% · {t('months', { n: agr.duration })}</div>
        </div>

        <h2 className="section-label">{t('agr_record')}</h2>
        <div className="group">
          <form className="inline-form" onSubmit={add}>
            <input type="number" inputMode="numeric" min="1" value={value} onChange={(e) => setValue(e.target.value)} placeholder={t('agr_record_ph')} aria-label={t('agr_record_ph')} />
            <button className="btn btn-primary" disabled={!(Number(value) > 0)}>{t('agr_record_btn')}</button>
          </form>
        </div>

        <h2 className="section-label">{t('agr_history')}</h2>
        <div className="group">
          {agr.payments.length === 0 ? (
            <div className="row plain"><span className="secondary subhead">{t('agr_none')}</span></div>
          ) : (
            [...agr.payments].reverse().map((p, i) => (
              <div key={i} className="row plain kv"><span className="subhead">{dateFmt(p.date)}</span><span className="val tnum" style={{ color: 'var(--good)' }}>+{fmt(p.amount)}</span></div>
            ))
          )}
        </div>

        <div className="stack">
          <a className="btn btn-wa btn-lg" href={`https://wa.me/?text=${encodeURIComponent(text)}`} target="_blank" rel="noreferrer"><Icon name="share" size={20} /> {t('agr_whatsapp')}</a>
        </div>
        <details className="more">
          <summary><Icon name="doc" size={18} /> {t('agr_full')}</summary>
          <pre className="contract">{text}</pre>
          <div className="btn-row">
            <button className="btn btn-tinted" onClick={copy}><Icon name={copied ? 'check' : 'copy'} size={20} /> {copied ? t('agr_copied') : t('agr_copy')}</button>
            <button className="btn btn-tinted" onClick={() => window.print()}><Icon name="print" size={20} /> {t('agr_print')}</button>
          </div>
        </details>
      </main>
    </>
  )
}
