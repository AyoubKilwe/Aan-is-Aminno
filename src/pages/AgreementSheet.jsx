import { useState } from 'react'
import Icon from '../components/Icon.jsx'
import { Sheet } from '../components/UI.jsx'
import { scoreBusiness, paybackMonths, fmt } from '../lib/trustScore.js'
import { contractText } from '../lib/contract.js'
import { RESERVE_RATIO } from '../data/businesses.js'

// Three simple questions (how much, what share, how long), the result, then save.
export default function AgreementSheet({ t, lang, group, invested, biz, onCancel, onCreate }) {
  const available = Math.max(0, Math.round(group.savings * (1 - RESERVE_RATIO) - invested))
  const [amount, setAmount] = useState(Math.min(biz.amountNeeded, available))
  const [share, setShare] = useState(40)
  const [duration, setDuration] = useState(24)
  const s = scoreBusiness(biz)

  const amt = Math.round(Number(amount) || 0)
  const over = amt > available
  const valid = amt > 0 && !over
  // The group's slice of profit scales with how much of the requested capital it provides.
  const portion = biz.amountNeeded ? Math.min(1, amt / biz.amountNeeded) : 0
  const monthly = Math.round(biz.monthlyProfit * portion * (share / 100))
  const back = paybackMonths(amt, biz.monthlyProfit * portion, share / 100)

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const save = async () => {
    setSaving(true); setError('')
    try { await onCreate(draft) } catch { setError(t('save_error')); setSaving(false) }
  }

  const draft = {
    id: `a${Date.now()}`, bizId: biz.id, businessName: biz.name, owner: biz.owner, area: biz.area,
    amount: amt, share, duration, date: new Date().toISOString(), payments: [],
  }

  const Choices = ({ value, onChange, options, label }) => (
    <div className="choice-row" role="radiogroup" aria-label={label}>
      {options.map((o) => (
        <button type="button" key={o.value} role="radio" aria-checked={value === o.value} className={`choice ${value === o.value ? 'on' : ''}`} onClick={() => onChange(o.value)}>{o.label}</button>
      ))}
    </div>
  )

  return (
    <Sheet title={biz.name} onCancel={onCancel} cancelLabel={t('cancel')}>
      <p style={{ margin: '14px 4px' }}><span className={`level-pill ${s.level}`}>{t(`lvl_${s.level}`)}</span></p>

      <div className="group">
        <div className="field">
          <label htmlFor="a-amt">{t('agr_amount')}</label>
          <input id="a-amt" type="number" inputMode="numeric" min="0" value={amount} onChange={(e) => setAmount(e.target.value)} aria-invalid={over} style={{ fontSize: 20, fontWeight: 700 }} />
          {over ? <span className="error-text">{t('agr_over', { n: fmt(available) })}</span> : <span className="hint">{t('agr_amount_hint', { n: fmt(available) })}</span>}
        </div>
        <div className="field">
          <span className="label">{t('agr_share_q')}</span>
          <Choices label={t('agr_share_q')} value={share} onChange={setShare} options={[30, 40, 50].map((v) => ({ value: v, label: `${v}%` }))} />
        </div>
        <div className="field">
          <span className="label">{t('agr_months_q')}</span>
          <Choices label={t('agr_months_q')} value={duration} onChange={setDuration} options={[12, 24, 36].map((v) => ({ value: v, label: t('months', { n: v }) }))} />
        </div>
      </div>

      <div className="money-card" style={{ marginTop: 16, padding: '16px 18px' }}>
        <div className="label">{t('agr_expect')}</div>
        <div className="big tnum" style={{ fontSize: 30, margin: '2px 0 6px' }}>{t('agr_per_month', { n: fmt(monthly) })}</div>
        <div className="label">{t('card_back')}: <b style={{ color: '#fff' }}>{Number.isFinite(back) ? t('months', { n: back }) : '—'}</b></div>
      </div>

      {error && <p className="error-text" role="alert" style={{ margin: '12px 4px 0' }}>{error}</p>}
      <div className="stack">
        <button className="btn btn-primary btn-lg" disabled={!valid || saving} onClick={save}><Icon name="check" size={20} /> {saving ? '…' : t('agr_create')}</button>
      </div>

      <details className="more">
        <summary><Icon name="doc" size={18} /> {t('agr_full')}</summary>
        <pre className="contract">{contractText({ lang, group, a: draft })}</pre>
      </details>
    </Sheet>
  )
}
