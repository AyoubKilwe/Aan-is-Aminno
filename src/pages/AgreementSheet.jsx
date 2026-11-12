import { useState } from 'react'
import { Sheet } from '../components/UI.jsx'
import { TrustRing } from '../components/Rings.jsx'
import { scoreBusiness, paybackMonths, fmt } from '../lib/trustScore.js'
import { contractText } from '../lib/contract.js'
import { RESERVE_RATIO } from '../data/businesses.js'

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

  const draft = {
    id: `a${Date.now()}`, bizId: biz.id, businessName: biz.name, owner: biz.owner, area: biz.area,
    amount: amt, share, duration, date: new Date().toISOString(), payments: [],
  }

  return (
    <Sheet
      title={t('agr_new')}
      onCancel={onCancel}
      cancelLabel={t('cancel')}
      action={<button className="nav-btn strong" disabled={!valid} onClick={() => onCreate(draft)}>{t('save')}</button>}
    >
      <div className="detail-head" style={{ marginTop: 16 }}>
        <TrustRing score={s.score} level={s.level} size={56} label={t('trust_of', { n: s.score })} />
        <div>
          <h2 className="title2" style={{ fontSize: 20 }}>{biz.name}</h2>
          <div className="footnote">{biz.owner} · {biz.area}</div>
        </div>
      </div>

      <div className="group">
        <div className="field">
          <label htmlFor="a-amt">{t('agr_amount')}</label>
          <input id="a-amt" type="number" inputMode="numeric" min="0" value={amount} onChange={(e) => setAmount(e.target.value)} aria-invalid={over} />
          {over ? <span className="error-text">{t('agr_over', { n: fmt(available) })}</span> : <span className="hint">{t('agr_amount_hint', { n: fmt(available) })}</span>}
        </div>
        <div className="field">
          <span className="label">{t('agr_split')}</span>
          <div className="split"><span>{t('agr_group')} <b>{share}%</b></span><span>{t('agr_ownerShare')} <b>{100 - share}%</b></span></div>
          <input type="range" min="10" max="90" step="5" value={share} onChange={(e) => setShare(Number(e.target.value))} aria-label={t('agr_split')} />
        </div>
        <div className="field">
          <span className="label">{t('agr_duration')}</span>
          <div className="stepper">
            <button type="button" onClick={() => setDuration(Math.max(6, duration - 6))} aria-label="−6">−</button>
            <span className="tnum">{t('months', { n: duration })}</span>
            <button type="button" onClick={() => setDuration(Math.min(60, duration + 6))} aria-label="+6">+</button>
          </div>
        </div>
      </div>

      <div className="group" style={{ marginTop: 16 }}>
        <div className="row plain kv"><span>{t('agr_expect')}</span><span className="val tnum">{t('agr_per_month', { n: fmt(monthly) })}</span></div>
        <div className="row plain kv"><span>{t('biz_payback')}</span><span className="val tnum">{Number.isFinite(back) ? t('months', { n: back }) : '—'}</span></div>
      </div>

      <h2 className="section-label">{t('agr_preview')}</h2>
      <pre className="contract">{contractText({ lang, group, a: draft })}</pre>

      <div className="stack">
        <button className="btn btn-primary" disabled={!valid} onClick={() => onCreate(draft)}>{t('agr_create')}</button>
      </div>
    </Sheet>
  )
}
